import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MenuItem, Order } from "./types"
import { db } from "./database"


interface MenuStore {
  items: MenuItem[]
  category: string[]
  // addItem: (item: Omit<MenuItem, "id">) => void
  // updateItem: (id: string, item: Partial<MenuItem>) => void
  // deleteItem: (id: string) => void
  // toggleAvailability: (id: string) => void
  setItems: (items: MenuItem[]) => void
  setCategory: (items: string[]) => void
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  items: [],
  category: [],

  setItems: (items) => set({ items }),
  setCategory: (category: string[]) => set({ category }),
}))

export const initializeMenuStore = async () => {
  const menuItems: MenuItem[] = await db.getMenuItems()
  const category: string[] = Array.from(new Set(menuItems.map((item: MenuItem) => item.category)))
  useMenuStore.getState().setItems(menuItems)
  useMenuStore.getState().setCategory(category)
}

initializeMenuStore()
