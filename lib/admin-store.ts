import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MenuItem, Order } from "./types"
import { db } from "./database"

// ------------------- Admin Auth Store -------------------

interface AdminState {
  isAuthenticated: boolean
  currentUser: {
    id: string
    email: string
    name: string
    role: string
  } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,

      login: async (email: string, password: string) => {
        if (
          (email === "demo@temboplus.com" && password === "Uy3883nhks&$_") ||
          (email === "demo@exceelhotel.com" && password === "exceelone2025")
        ) {
          const currentUser = {
            id: email,
            email: email,
            name: "Admin User",
            role: "admin"
          }
          set({ isAuthenticated: true, currentUser })
          return true
        } else if (
          (email === "restaurant@exceelhotel.com" && password === "restaurant2025")
        ) {
          const currentUser = {
            id: email,
            email: email,
            name: "Restaurant user",
            role: "restaurant"
          }
          set({ isAuthenticated: true, currentUser })
          return true
        }
        return false
      },

      logout: () => {
        set({ isAuthenticated: false, currentUser: null })
      },
    }),
    {
      name: "admin-auth",
    }
  )
)

// ------------------- Menu Store -------------------

interface MenuStore {
  items: MenuItem[]
  category: string[]
  addItem: (item: Omit<MenuItem, "id">) => void
  updateItem: (id: string, item: Partial<MenuItem>) => void
  deleteItem: (id: string) => void
  toggleAvailability: (id: string) => void
  setItems: (items: MenuItem[]) => void
  setCategory: (items: string[]) => void
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  items: [],
  category: [],

  addItem: async (item) => {
    try {
      const newItem = await db.addMenuItem(item)
      set((state: any) => ({ items: [...state.items, newItem] }))
    } catch (error) {
      console.log("Failed to add menu item:", error)
    }
  },

  updateItem: async (id, updates) => {
    try {
      const updatedItem = await db.updateMenuItem(id, updates)
      set((state: any) => ({
        items: state.items.map((item: any) => (item.id === id ? updatedItem : item)),
      }))
    } catch (error) {
      console.error("Failed to update menu item:", error)
    }
  },

  deleteItem: async (id) => {
    try {
      await db.deleteMenuItem(id)
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }))
    } catch (error) {
      console.error("Failed to delete menu item:", error)
    }
  },

  toggleAvailability: async (id) => {
    try {
      const item = get().items.find((i) => i.id === id)
      if (!item) return
      const updatedItem = await db.updateMenuItem(id, { is_available: !item.is_available })
      set((state: any) => ({
        items: state.items.map((i: any) => (i.id === id ? updatedItem : i)),
      }))
    } catch (error) {
      console.error("Failed to toggle availability:", error)
    }
  },

  setItems: (items) => set({ items }),
  setCategory: (category: string[]) => set({ category }),
}))

export const initializeMenuStore = async () => {
  const menuItems: any = await db.getAdminMenuItems()
  const category: string[] = Array.from(new Set(menuItems.map((item: MenuItem) => item.category)))
  useMenuStore.getState().setItems(menuItems)
  useMenuStore.getState().setCategory(category)
}

initializeMenuStore()

// ------------------- Order Management Store -------------------

interface OrderManagementStore {
  orders: Order[]
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  setOrders: (orders: Order[]) => void
  fetchOrders: () => Promise<void>
  getOrderById: (id: string) => Order | undefined
  getOrdersByStatus: (status: Order["status"]) => Order[]
}

export const useOrderManagementStore = create<OrderManagementStore>((set, get) => ({
  orders: [],

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    }))
  },

  setOrders: (orders) => set({ orders }),

  fetchOrders: async () => {
    try {
      const orders: any = await db.getAllOrders()
      set({ orders })
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  },

  getOrderById: (id) => {
    return get().orders.find((order) => order.id === id)
  },

  getOrdersByStatus: (status) => {
    return get().orders.filter((order) => order.status === status)
  },
}))

export const initializeOrderStore = async () => {
  await useOrderManagementStore.getState().fetchOrders()
}
initializeOrderStore()