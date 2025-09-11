import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DatabaseOrder {
  id: string
  order_number: string
  customer_id?: string
  customer_info: {
    name: string
    email?: string
    phone: string
  }
  order_type: "delivery" | "dine-in"
  delivery_address?: string
  dine_in_info?: {
    location: string
    table?: string
    room?: string
  }
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: string
  payment_status: "pending" | "paid" | "failed" | "refunded"
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  notes?: string
  receipt_confirmed?: boolean
  receipt_confirmed_at?: string
  receipt_confirmed_by?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id?: string
  item_name: string
  item_price: number
  quantity: number
  special_instructions?: string
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category: string
  image_url?: string
  is_available: boolean
}

class SupabaseDatabase {
  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("category", { ascending: true })

    if (error) throw error
    return data || []
  }

  async getAdminMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("category", { ascending: true })

    if (error) throw error
    return data || []
  }

  async addMenuItem(item: Omit<MenuItem, "id">): Promise<MenuItem> {
    console.log()
    const { data, error } = await supabase
      .from("menu_items")
      .insert([item])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteMenuItem(id: string): Promise<void> {
    const { error } = await supabase.from("menu_items").delete().eq("id", id)
    if (error) throw error
  }




  // Orders
  async createOrder(orderData: {
    customer_info: any
    order_type: "delivery" | "dine-in"
    delivery_address?: string
    dine_in_info?: any
    subtotal: number
    delivery_fee: number
    total: number
    payment_method: string
    items: any[]
  }): Promise<DatabaseOrder> {
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create customer if not exists and email is provided
      let customerId: string | null = null
      if (orderData.customer_info.email) {
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", orderData.customer_info.email)
          .maybeSingle()

        if (existingCustomer) {
          customerId = existingCustomer.id
        } else {
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
              name: orderData.customer_info.name,
              email: orderData.customer_info.email,
              phone: orderData.customer_info.phone,
            })
            .select("id")
            .single()

          if (customerError) {
            console.error("Customer creation error:", customerError)
          } else {
            customerId = newCustomer.id
          }
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_id: customerId,
          customer_info: orderData.customer_info,
          order_type: orderData.order_type,
          delivery_address: orderData.delivery_address,
          dine_in_info: orderData.dine_in_info,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.delivery_fee,
          total: orderData.total,
          payment_method: orderData.payment_method,
          payment_status: "pending",
          status: "pending",
        })
        .select()
        .single()

      if (orderError) {
        console.error("Order creation error:", orderError)
        throw orderError
      }

      // Create order items
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        menu_item_id: this.isValidUUID(item.id) ? item.id : null,
        item_name: item.name,
        item_price: item.price,
        quantity: item.quantity,
        special_instructions: item.special_instructions || null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Order items creation error:", itemsError)
      }

      // Fetch the complete order with items
      const { data: completeOrder } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("id", order.id)
        .single()

      return completeOrder || order
    } catch (error) {
      console.error("Database operation failed:", error)
      throw error
    }
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  async getOrderById(id: string): Promise<DatabaseOrder | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null
        throw error
      }

      return data
    } catch (error) {
      console.error("Error fetching order by ID:", error)
      return null
    }
  }

  async getUserOrders(userEmail: string): Promise<DatabaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .contains("customer_info", { email: userEmail })
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching user orders:", error)
      return []
    }
  }

  async getPorterOrders(): Promise<DatabaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .in("status", ["ready", "delivered"])
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching porter orders:", error)
      return []
    }
  }

  async getAllOrders(): Promise<DatabaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching all orders:", error)
      return []
    }
  }

  async updateOrderStatus(id: string, status: DatabaseOrder["status"], notes?: string): Promise<DatabaseOrder | null> {
    try {
      const { data: currentOrder } = await supabase.from("orders").select("status").eq("id", id).single()

      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update({
          status,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      if (currentOrder && currentOrder.status !== status) {
        await supabase.from("order_status_history").insert({
          order_id: id,
          old_status: currentOrder.status,
          new_status: status,
          changed_by: "admin",
          notes,
        })
      }

      return updatedOrder
    } catch (error) {
      console.error("Error updating order status:", error)
      return null
    }
  }

  async updateOrderStatusByPorter(
    id: string,
    status: DatabaseOrder["status"],
    porterId: string,
  ): Promise<{ error?: string }> {
    try {
      const { data: currentOrder } = await supabase.from("orders").select("status").eq("id", id).single()

      const { error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      if (currentOrder && currentOrder.status !== status) {
        await supabase.from("order_status_history").insert({
          order_id: id,
          old_status: currentOrder.status,
          new_status: status,
          changed_by: `porter:${porterId}`,
        })
      }

      return {}
    } catch (error) {
      console.error("Error updating order status by porter:", error)
      return { error: "Failed to update order status" }
    }
  }

  async confirmOrderReceipt(orderId: string, userId: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          receipt_confirmed: true,
          receipt_confirmed_at: new Date().toISOString(),
          receipt_confirmed_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("status", "delivered")

      if (error) throw error

      return {}
    } catch (error) {
      console.error("Error confirming order receipt:", error)
      return { error: "Failed to confirm order receipt" }
    }
  }

  // Real-time subscriptions
  subscribeToOrders(callback: (orders: DatabaseOrder[]) => void): () => void {
    const subscription = supabase
      .channel("joto-foods")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async () => {
        const orders = await this.getAllOrders()
        callback(orders)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }

  subscribeToOrder(orderId: string, callback: (order: DatabaseOrder | null) => void): () => void {
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        async () => {
          const order = await this.getOrderById(orderId)
          callback(order)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }

}

export const db = new SupabaseDatabase()
