import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserLocation, BaseLocation } from "./types"
import { db } from "@/lib/database"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDistance(userLocation: UserLocation, baseLocation: BaseLocation): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(userLocation.latitude - Number(baseLocation.latitude))
  const dLon = toRad(userLocation.longitude - Number(baseLocation.longitude))

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(Number(baseLocation.latitude))) *
    Math.cos(toRad(Number(userLocation.latitude))) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export async function calculateDeliveryFee(distance: number): Promise<number> {
  // Fetch hotel info
  const data: any = await db.getHotelInformation();
  const settingItems: any = data[0];

  // ✅ Convert to numbers safely
  const baseFee: number = Number(settingItems?.base_delivery_fee ?? 0); // e.g. 2000 TZS
  const perKmFee: number = Number(settingItems?.per_km_fee ?? 0);        // e.g. 500 TZS
  console.log("the data in the utils", baseFee + " per km" + perKmFee);

  if (distance <= 2) return baseFee;
  return baseFee + Math.ceil(distance - 2) * perKmFee;
}


export function estimateDeliveryTime(distance: number): string {
  const baseTime = 20 // 20 minutes base time
  const additionalTime = Math.ceil(distance) * 5 // 5 minutes per km
  const totalTime = baseTime + additionalTime

  return `${totalTime}-${totalTime + 10} minutes`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("sw-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function findNearestBaseLocation(
  userLocation: UserLocation,
  baseLocations: BaseLocation[],
): BaseLocation | null {
  if (baseLocations.length === 0) return null

  let nearest = baseLocations[0]
  let shortestDistance = calculateDistance(userLocation, nearest)

  for (const location of baseLocations) {
    const distance = calculateDistance(userLocation, location)
    if (distance < shortestDistance && distance <= location.deliveryRadius) {
      shortestDistance = distance
      nearest = location
    }
  }

  return shortestDistance <= nearest.deliveryRadius ? nearest : null
}

// Image upload utility
export function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // In a real app, you'd upload to a server or cloud storage
      // For now, we'll store in localStorage or return the data URL
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
