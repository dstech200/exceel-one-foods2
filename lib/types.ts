export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_available: boolean
  customizations?: MenuCustomization[]
  created_at: string
  updated_at: string
}

export interface MenuCustomization {
  id: string
  name: string
  type: "single" | "multiple"
  required: boolean
  options: CustomizationOption[]
}

export interface CustomizationOption {
  id: string
  name: string
  price: number
}

export interface CartItem extends MenuItem {
  quantity: number
  selectedCustomizations?: SelectedCustomization[]
  customizationPrice?: number
}

export interface SelectedCustomization {
  customizationId: string
  customizationName: string
  selectedOptions: CustomizationOption[]
}

export interface UserLocation {
  latitude: number
  longitude: number
  address: string
  city: string
  country: string
  district?: string
  ward?: string
  street?: string
}

export interface BaseLocation {
  id: string
  name: string
  address: string
  latitude: string
  longitude: string
  isActive: boolean
  deliveryRadius: number
  createdAt: Date
}

export interface DeliveryInfo {
  distance: number
  fee: number
  estimatedTime: string
  baseLocation: BaseLocation
}

export interface DineInInfo {
  type: "room" | "restaurant"
  location: string
  tableNumber?: string
  roomNumber?: string
  floor?: string
  section?: string
}

export interface Order {
  id: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  customer_info: CustomerInfo
  orderType: "delivery" | "dine-in"
  deliveryAddress?: string
  dineInInfo?: DineInInfo
  paymentMethod: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  baseLocation?: BaseLocation
  created_at: Date
}

export interface CustomerInfo {
  name: string
  phone: string
  email: string
}

export interface PaymentRequest {
  amount: number
  phone: string
  email: string
  orderId: string
}

export interface RestaurantInfo {
  name: string
  description: string
  address: string
  phone: string
  email: string
  coordinates: {
    latitude: number
    longitude: number
  }
  hours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
}
