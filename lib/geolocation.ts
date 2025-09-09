import type { UserLocation } from "./types"

export async function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const address = await reverseGeocode(latitude, longitude)
          resolve({
            latitude,
            longitude,
            address: address.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            city: address.city || address.town || address.village || "Dar es Salaam",
            country: address.country || "Tanzania",
            district: address.state_district || address.county,
            ward: address.suburb || address.neighbourhood,
            street: address.road || address.street,
          })
        } catch (error) {
          // Enhanced fallback with more detailed location
          resolve({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            city: "Dar es Salaam",
            country: "Tanzania",
            district: "Kinondoni",
            ward: "Msasani",
            street: "Unknown Street",
          })
        }
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      },
    )
  })
}

async function reverseGeocode(lat: number, lon: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en`,
  )

  if (!response.ok) {
    throw new Error("Failed to reverse geocode")
  }

  return response.json()
}
