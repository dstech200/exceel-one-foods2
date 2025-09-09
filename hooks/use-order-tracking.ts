"use client"

import { useEffect, useState } from "react"
import { db, type DatabaseOrder } from "@/lib/database"

export function useOrderTracking(orderId: string) {
  const [order, setOrder] = useState<DatabaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided")
      setLoading(false)
      return
    }

    const loadOrder = async () => {
      try {
        setLoading(true)
        const orderData = await db.getOrderById(orderId)
        if (orderData) {
          setOrder(orderData)
          setError(null)
        } else {
          setError("Order not found")
        }
      } catch (err) {
        setError("Failed to load order")
        console.error("Order loading error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()

    // Set up real-time subscription for this specific order
    const unsubscribe = db.subscribeToOrder(orderId, (updatedOrder) => {
      if (updatedOrder) {
        setOrder(updatedOrder)
        setError(null)
      }
    })

    return unsubscribe
  }, [orderId])

  const refreshOrder = async () => {
    if (!orderId) return

    try {
      setLoading(true)
      const orderData = await db.getOrderById(orderId)
      if (orderData) {
        setOrder(orderData)
        setError(null)
      } else {
        setError("Order not found")
      }
    } catch (err) {
      setError("Failed to refresh order")
      console.error("Order refresh error:", err)
    } finally {
      setLoading(false)
    }
  }

  return { order, loading, error, refreshOrder }
}
