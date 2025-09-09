import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  CartItem,
  MenuItem,
  UserLocation,
  DeliveryInfo,
  DineInInfo,
  BaseLocation,
  SelectedCustomization,
} from "./types"

interface CartStore {
  items: CartItem[]
  orderType: "delivery" | "dine-in"
  addItem: (item: MenuItem, customizations?: SelectedCustomization[]) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setOrderType: (type: "delivery" | "dine-in") => void
  getSubtotal: () => number
  getItemCount: () => number
}

interface LocationStore {
  location: UserLocation | null
  deliveryInfo: DeliveryInfo | null
  dineInInfo: DineInInfo | null
  baseLocations: BaseLocation[]
  setLocation: (location: UserLocation) => void
  setDeliveryInfo: (info: DeliveryInfo) => void
  setDineInInfo: (info: DineInInfo) => void
  setBaseLocations: (locations: BaseLocation[]) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: "dine-in",
      addItem: (item, customizations = []) => {
        const items = get().items
        const customizationPrice = customizations.reduce(
          (total, custom) => total + custom.selectedOptions.reduce((sum, option) => sum + option.price, 0),
          0,
        )

        const cartItem: CartItem = {
          ...item,
          quantity: 1,
          selectedCustomizations: customizations,
          customizationPrice,
        }

        // Check if exact same item with same customizations exists
        const existingItemIndex = items.findIndex(
          (i) => i.id === item.id && JSON.stringify(i.selectedCustomizations) === JSON.stringify(customizations),
        )

        if (existingItemIndex !== -1) {
          set({
            items: items.map((i, index) => (index === existingItemIndex ? { ...i, quantity: i.quantity + 1 } : i)),
          })
        } else {
          set({
            items: [...items, cartItem],
          })
        }
      },
      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        })
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set({
          items: get().items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })
      },
      clearCart: () => set({ items: [] }),
      setOrderType: (orderType) => set({ orderType }),
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const itemPrice = item.price + (item.customizationPrice || 0)
          return total + itemPrice * item.quantity
        }, 0)
      },
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

export const useLocationStore = create<LocationStore>((set) => ({
  location: null,
  deliveryInfo: null,
  dineInInfo: null,
  baseLocations: [
    {
      id: "1",
      name: "Exceel One Hotel - Main Branch",
      address: "Msasani Peninsula, Dar es Salaam",
      latitude: -6.7924,
      longitude: 39.2083,
      isActive: true,
      deliveryRadius: 15,
      createdAt: new Date(),
    },
  ],
  setLocation: (location) => set({ location }),
  setDeliveryInfo: (deliveryInfo) => set({ deliveryInfo }),
  setDineInInfo: (dineInInfo) => set({ dineInInfo }),
  setBaseLocations: (baseLocations) => set({ baseLocations }),
}))
