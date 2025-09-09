import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { items, customerInfo, orderType, deliveryAddress, dineInInfo, paymentMethod, subtotal, deliveryFee, total } =
      body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return NextResponse.json({ error: "Customer information is required" }, { status: 400 })
    }

    if (!orderType || !["delivery", "dine-in"].includes(orderType)) {
      return NextResponse.json({ error: "Valid order type is required" }, { status: 400 })
    }

    // Create order in database
    const order = await db.createOrder({
      customer_info: customerInfo,
      order_type: orderType,
      delivery_address: deliveryAddress,
      dine_in_info: dineInInfo,
      subtotal: subtotal || 0,
      delivery_fee: deliveryFee || 0,
      total: total || 0,
      payment_method: paymentMethod || "mpesa",
      items: items || [],
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "Failed to create order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const orders = await db.getAllOrders()
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
