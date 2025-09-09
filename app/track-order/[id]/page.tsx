"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, CheckCircle, Truck, UtensilsCrossed, MapPin, Phone, Mail, RefreshCw } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useOrderTracking } from "@/hooks/use-order-tracking"
import { formatCurrency } from "@/lib/utils"

const statusSteps = {
  pending: { step: 1, label: "Order Received", icon: Clock, description: "We've received your order" },
  confirmed: { step: 2, label: "Order Confirmed", icon: CheckCircle, description: "Your order has been confirmed" },
  preparing: { step: 3, label: "Preparing", icon: UtensilsCrossed, description: "Your order is being prepared" },
  ready: { step: 4, label: "Ready", icon: CheckCircle, description: "Your order is ready" },
  delivered: { step: 5, label: "Delivered", icon: Truck, description: "Your order has been delivered" },
  cancelled: { step: 0, label: "Cancelled", icon: Clock, description: "Your order has been cancelled" },
}

export default function TrackOrderPage() {
  const params = useParams()
  const orderId = params.id as string
  const { order, loading, error, refreshOrder } = useOrderTracking(orderId)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The order you're looking for doesn't exist."}</p>
            <div className="flex items-center justify-center space-x-4">
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Menu
                </Button>
              </Link>
              <Button variant="outline" onClick={refreshOrder}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const currentStep = statusSteps[order.status as keyof typeof statusSteps]
  const progress = order.status === "cancelled" ? 0 : (currentStep.step / 5) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "preparing":
        return "secondary"
      case "ready":
        return "outline"
      case "delivered":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold ml-4">Track Order</h1>
          </div>
          <Button variant="outline" onClick={refreshOrder}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order {order.order_number}</CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.status !== "cancelled" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Order Progress</span>
                        <span className="text-sm text-muted-foreground">{currentStep.label}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="space-y-3">
                    {Object.entries(statusSteps)
                      .filter(([status]) => status !== "cancelled")
                      .map(([status, step]) => {
                        const Icon = step.icon
                        const isCompleted = step.step <= currentStep.step && order.status !== "cancelled"
                        const isCurrent = status === order.status

                        return (
                          <div
                            key={status}
                            className={`flex items-center space-x-3 ${
                              isCompleted ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            <div
                              className={`rounded-full p-2 ${
                                isCompleted ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isCurrent ? "text-primary" : ""}`}>{step.label}</p>
                              {isCurrent && <p className="text-sm text-muted-foreground">{step.description}</p>}
                            </div>
                          </div>
                        )
                      })}

                    {order.status === "cancelled" && (
                      <div className="flex items-center space-x-3 text-destructive">
                        <div className="rounded-full p-2 bg-destructive text-destructive-foreground">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Order Cancelled</p>
                          <p className="text-sm text-muted-foreground">Your order has been cancelled</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Name:</span>
                  <span>{order.customer_info.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{order.customer_info.phone}</span>
                </div>
                {order.customer_info.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{order.customer_info.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery/Service Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>{order.order_type === "delivery" ? "Delivery" : "Service"} Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.order_type === "delivery" ? (
                  <div className="space-y-2">
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    {order.delivery_fee > 0 && (
                      <p className="text-sm">Delivery Fee: {formatCurrency(order.delivery_fee)}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium">
                      {order.dine_in_info?.type === "room" ? "Room Service" : "Restaurant Service"}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.dine_in_info?.location}</p>
                    {order.dine_in_info?.room && <p className="text-sm">Room: {order.dine_in_info.room}</p>}
                    {order.dine_in_info?.table && <p className="text-sm">Table: {order.dine_in_info.table}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>
                  Payment Method: {order.payment_method} • Status: {order.payment_status}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.order_items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      {item.special_instructions && (
                        <p className="text-xs text-muted-foreground mt-1">Note: {item.special_instructions}</p>
                      )}
                    </div>
                    <p className="font-medium">{formatCurrency(item.item_price * item.quantity)}</p>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{formatCurrency(order.delivery_fee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {order.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium">Order Notes:</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact us at{" "}
                    <a href="tel:+255123456789" className="text-primary hover:underline">
                      +255 123 456 789
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
