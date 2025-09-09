"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { db } from "@/lib/database"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { DatabaseOrder } from "@/lib/database"
import { Clock, CheckCircle, UtensilsCrossed, Truck, X, Eye, RefreshCw } from "lucide-react"
import Link from "next/link"

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: UtensilsCrossed,
  ready: CheckCircle,
  delivered: Truck,
  cancelled: X,
}

const statusColors = {
  pending: "secondary",
  confirmed: "default",
  preparing: "secondary",
  ready: "outline",
  delivered: "outline",
  cancelled: "destructive",
} as const

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<DatabaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchUserOrders()
    }
  }, [user])

  const fetchUserOrders = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      setError(null)
      const userOrders = await db.getUserOrders(user.email)
      setOrders(userOrders)
    } catch (err) {
      console.error("Error fetching user orders:", err)
      setError("Failed to load your orders")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReceipt = async (orderId: string) => {
    try {
      const { error } = await db.confirmOrderReceipt(orderId, user?.id || "")

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Order Confirmed",
          description: "Thank you for confirming receipt of your order!",
        })
        // Refresh orders
        await fetchUserOrders()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm order receipt",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">View your order history and track current orders</p>
          </div>
          <Button onClick={fetchUserOrders} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchUserOrders}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {orders.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
                <Link href="/">
                  <Button>Browse Menu</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons]
            const canConfirmReceipt = order.status === "delivered" && !order.receipt_confirmed

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>Order {order.order_number}</span>
                          <Badge variant={statusColors[order.status as keyof typeof statusColors]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
                          {new Date(order.created_at).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {canConfirmReceipt && (
                          <Button onClick={() => handleConfirmReceipt(order.id)} size="sm">
                            Confirm Receipt
                          </Button>
                        )}
                        <Link href={`/track-order/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Track
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Type and Location */}
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">Type: </span>
                          <Badge variant="outline">{order.order_type}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">Payment: </span>
                          {order.payment_method}
                        </div>
                      </div>

                      {/* Location Info */}
                      {order.order_type === "delivery" && order.delivery_address && (
                        <div>
                          <span className="font-medium text-sm">Delivery Address: </span>
                          <span className="text-sm text-muted-foreground">{order.delivery_address}</span>
                        </div>
                      )}

                      {order.order_type === "dine-in" && order.dine_in_info && (
                        <div>
                          <span className="font-medium text-sm">Service Location: </span>
                          <span className="text-sm text-muted-foreground">
                            {order.dine_in_info.location}
                            {order.dine_in_info.room && ` - Room ${order.dine_in_info.room}`}
                            {order.dine_in_info.table && ` - Table ${order.dine_in_info.table}`}
                          </span>
                        </div>
                      )}

                      <Separator />

                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium mb-2">Items Ordered:</h4>
                        <div className="space-y-2">
                          {order.order_items?.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>
                                {item.quantity}x {item.item_name}
                              </span>
                              <span className="font-medium">{formatCurrency(item.item_price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Order Total */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.delivery_fee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Delivery Fee:</span>
                            <span>{formatCurrency(order.delivery_fee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </div>

                      {/* Receipt Confirmation Status */}
                      {order.status === "delivered" && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Receipt Status:</span>
                            <Badge variant={order.receipt_confirmed ? "outline" : "secondary"}>
                              {order.receipt_confirmed ? "Confirmed" : "Pending Confirmation"}
                            </Badge>
                          </div>
                          {order.receipt_confirmed && order.receipt_confirmed_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Confirmed on {new Date(order.receipt_confirmed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
