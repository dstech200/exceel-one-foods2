"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, Clock, Phone, Car, UtensilsCrossed } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { db, type DatabaseOrder } from "@/lib/database"
import { formatCurrency } from "@/lib/utils"
import { useCartStore, useLocationStore } from "@/lib/store"

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<DatabaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { clearCart } = useCartStore()


  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log("Fetching order with ID:", params.id)
        const foundOrder = await db.getOrderById(params.id)
        console.log("Found order:", foundOrder)

        if (foundOrder) {
          setOrder(foundOrder)
        } else {
          setError("Order not found")
        }
      } catch (error) {
        console.error("Failed to fetch order:", error)
        setError("Failed to load order details")
      } finally {
        setLoading(false)
        clearCart()
      }
    }
    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading order details...</p>
          </div>
        </main>
      </div>
    )
  } else

    if (error || !order) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
              <p className="text-muted-foreground mb-6">{error || "The order you're looking for doesn't exist."}</p>
              <Link href="/">
                <Button>Back to Menu</Button>
              </Link>
            </div>
          </main>
        </div>
      )
    }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "preparing":
        return "bg-yellow-500"
      case "ready":
        return "bg-blue-500"
      case "delivered":
        return "bg-green-600"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "confirmed":
        return "Confirmed"
      case "preparing":
        return "Preparing"
      case "ready":
        return "Ready"
      case "delivered":
        return "Delivered"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  // Safely access customer info
  const customerInfo = order.customer_info || {}
  const customerName = customerInfo.name || "Customer"
  const customerPhone = customerInfo.phone || "N/A"
  const customerEmail = customerInfo.email || ""

  // Safely access order items
  const orderItems = order.order_items || []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order, {customerName}. We'll prepare it with care.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order #{order.order_number || order.id}</span>
                <Badge variant="default" className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Ordered on {new Date(order.created_at).toLocaleString()}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {order.order_type === "delivery" ? (
                  <>
                    <Car className="h-4 w-4" />
                    <span>Delivery to: {order.delivery_address || "Address not provided"}</span>
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="h-4 w-4" />
                    <span>
                      Dine-in at: {order.dine_in_info?.location || "Restaurant"}
                      {order.dine_in_info?.table && ` - Table ${order.dine_in_info.table}`}
                      {order.dine_in_info?.room && ` - Room ${order.dine_in_info.room}`}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{customerPhone}</span>
              </div>

              {customerEmail && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>📧</span>
                  <span>{customerEmail}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between">
                    <span>
                      {item.item_name} x{item.quantity}
                      {item.special_instructions && (
                        <span className="text-sm text-muted-foreground block">Note: {item.special_instructions}</span>
                      )}
                    </span>
                    <span>{formatCurrency(item.item_price * item.quantity)}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No items found</div>
              )}

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.order_type === "delivery" && order.delivery_fee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(order.delivery_fee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span>Payment Method</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Payment Status</span>
                <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                  {order.payment_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Link href={`/track-order/${order.id}`} className="flex-1">
              <Button className="w-full">Track Order</Button>
            </Link>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  )
}
