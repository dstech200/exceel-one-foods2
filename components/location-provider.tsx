"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentLocation } from "@/lib/geolocation"
import { calculateDistance, calculateDeliveryFee, estimateDeliveryTime, findNearestBaseLocation } from "@/lib/utils"
import { useLocationStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

const LocationContext = createContext<{
  requestLocation: () => Promise<void>
  isLoading: boolean
}>({
  requestLocation: async () => { },
  isLoading: false,
})

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const { setLocation, setDeliveryInfo, baseLocations } = useLocationStore()
  const { toast } = useToast()

  const requestLocation = async () => {
    setIsLoading(true)
    try {
      const location = await getCurrentLocation()


      // Find nearest base location
      const activeLocations = baseLocations.filter(item => item.isActive === true)
      const nearestBase = findNearestBaseLocation(location, activeLocations)

      if (nearestBase) {
        setLocation(location)
        const distance = calculateDistance(location, nearestBase)
        const fee = await calculateDeliveryFee(distance)
        const estimatedTime = estimateDeliveryTime(distance)

        setDeliveryInfo({
          distance,
          fee,
          estimatedTime,
          baseLocation: nearestBase,
        })

        toast({
          title: "Location Updated",
          description: `${location.street ? location.street + ", " : ""}${location.ward ? location.ward + ", " : ""}${location.city} - Delivery: ${fee.toLocaleString()} TZS`,
        })
      } else {
        toast({
          title: "Location Outside Delivery Area",
          description: "Sorry, we don't deliver to your location yet.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not get your location. Please enable location services and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Auto-request location on first visit
    const hasRequestedLocation = localStorage.getItem("location-requested")
    if (!hasRequestedLocation) {
      requestLocation()
      localStorage.setItem("location-requested", "true")
    }
  }, [])

  return <LocationContext.Provider value={{ requestLocation, isLoading }}>{children}</LocationContext.Provider>
}

export const useLocation = () => useContext(LocationContext)
