import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MenuItem, Order } from "./types"
import { db } from "./database"

interface AdminState {
  isAuthenticated: boolean
  adminUser: {
    id: string
    email: string
    name: string
  } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

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

interface OrderManagementStore {
  orders: Order[]
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  setOrders: (orders: Order[]) => void
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "manager"
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminUser: null,

      login: async (email: string, password: string) => {
        // Simple admin authentication - in production, use proper auth
        if ((email === "demo@temboplus.com" && password === "Uy3883nhks&$_") || (email === "demo@exceelhotel.com" && password === "exceelone2025")) {
          const adminUser = {
            id: email,
            email: email,
            name: "Admin User",
          }
          set({ isAuthenticated: true, adminUser })
          return true
        }
        return false
      },

      logout: () => {
        set({ isAuthenticated: false, adminUser: null })
      },
    }),
    {
      name: "admin-auth",
    },
  ),
)


export const useMenuStore = create<MenuStore>((set, get) => {
  const store: MenuStore = {
    items: [],
    category: [],
    addItem: async (item) => {
      try {
        const newItem = await db.addMenuItem(item) // Call your db method to add item to Supabase
        set((state: any) => ({ items: [...state.items, newItem] }))
      } catch (error) {
        console.log("Failed to add menu item:", error)
      }
    },

    updateItem: async (id, updates) => {
      try {
        const updatedItem = await db.updateMenuItem(id, updates) // Update in Supabase
        set((state: any) => ({
          items: state.items.map((item: any) => (item.id === id ? updatedItem : item)),
        }))
      } catch (error) {
        console.error("Failed to update menu item:", error)
      }
    },

    deleteItem: async (id) => {
      try {
        const deleted = await db.deleteMenuItem(id) // Delete from Supabase
        console.log("the deleted item" + deleted)
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
        const updatedItem = await db.updateMenuItem(id, { is_available: !item.is_available }) // Toggle in Supabase
        set((state: any) => ({
          items: state.items.map((i: any) => (i.id === id ? updatedItem : i)),
        }))
      } catch (error) {
        console.error("Failed to toggle availability:", error)
      }
    },

    setItems: (items) => set({ items }),
    setCategory: (category: string[]) => set({ category }),
  }

  return store

})
// Initial fetch to populate items from Supabase on store creation
export const initializeMenuStore = async () => {
  const menuItems: MenuItem[] = await db.getAdminMenuItems();
  const category: string[] = Array.from(new Set(menuItems.map((item: MenuStore) => item.category)));
  // Populate the store with data
  useMenuStore.getState().setItems(menuItems);
  useMenuStore.getState().setCategory(category);
};


initializeMenuStore()

export const useOrderManagementStore = create<OrderManagementStore>((set) => ({
  orders: [],
  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
    }))
  },
  setOrders: (orders) => set({ orders }),
}))

