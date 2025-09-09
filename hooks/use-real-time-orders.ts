"use client"

import { useEffect, useState } from "react"
import { db, type DatabaseOrder } from "@/lib/database"

export function useRealTimeOrders() {
  const [orders, setOrders] = useState<DatabaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial load
    const loadOrders = async () => {
      try {
        setLoading(true)
        const allOrders = await db.getAllOrders()
        setOrders(allOrders)
        setError(null)
      } catch (err) {
        console.error("Failed to load orders:", err)
        setError("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()

    // Set up real-time subscription
    const unsubscribe = db.subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders)
    })

    return unsubscribe
  }, [])

  const refreshOrders = async () => {
    try {
      setLoading(true)
      const allOrders = await db.getAllOrders()
      setOrders(allOrders)
      setError(null)
    } catch (err) {
      console.error("Failed to refresh orders:", err)
      setError("Failed to refresh orders")
    } finally {
      setLoading(false)
    }
  }

  return { orders, loading, error, refreshOrders }
}
