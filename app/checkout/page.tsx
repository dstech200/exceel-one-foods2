"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Smartphone } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCartStore, useLocationStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, getSubtotal, clearCart, orderType } = useCartStore()
  const { location, deliveryInfo, dineInInfo } = useLocationStore()

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = getSubtotal()
  const deliveryFee = orderType === "delivery" ? deliveryInfo?.fee || 0 : 0
  const total = subtotal + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (orderType === "delivery" && !location) {
      toast({
        title: "Location Required",
        description: "Please set your delivery location",
        variant: "destructive",
      })
      return
    }

    if (orderType === "dine-in" && !dineInInfo) {
      toast({
        title: "Service Location Required",
        description: "Please set your dine-in location details",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          customerInfo,
          orderType,
          deliveryAddress: orderType === "delivery" ? location?.address : undefined,
          dineInInfo: orderType === "dine-in" ? dineInInfo : undefined,
          paymentMethod,
          subtotal,
          deliveryFee,
          total,
        }),
      })

      if (response.ok) {
        const order = await response.json()
        clearCart()
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${order.id} has been confirmed`,
        })
        router.push(`/order-confirmation/${order.id}`)
      } else {
        throw new Error("Failed to place order")
      }
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">No Items to Checkout</h1>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+255 XXX XXX XXX"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{orderType === "delivery" ? "Delivery Address" : "Service Location"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderType === "delivery" ? (
                    location ? (
                      <div className="space-y-2">
                        <p className="font-medium">{location.city}</p>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                        {deliveryInfo && (
                          <div className="text-sm text-muted-foreground">
                            <p>Distance: {deliveryInfo.distance}km</p>
                            <p>Estimated delivery: {deliveryInfo.estimatedTime}</p>
                            <p>Delivery fee: {formatCurrency(deliveryInfo.fee)}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Please set your delivery location</p>
                    )
                  ) : dineInInfo ? (
                    <div className="space-y-2">
                      <p className="font-medium">
                        {dineInInfo.type === "room" ? "Room Service" : "Restaurant Service"}
                      </p>
                      <p className="text-sm text-muted-foreground">{dineInInfo.location}</p>
                      <div className="text-sm text-muted-foreground">
                        {dineInInfo.type === "room" ? (
                          <>
                            <p>Floor: {dineInInfo.floor}</p>
                            <p>Room: {dineInInfo.roomNumber}</p>
                          </>
                        ) : (
                          <>
                            <p>Section: {dineInInfo.section}</p>
                            <p>Table: {dineInInfo.tableNumber}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Please set your dine-in location</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mpesa" id="mpesa" />
                      <Label htmlFor="mpesa" className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Vodacom M-Pesa</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="airtel" id="airtel" />
                      <Label htmlFor="airtel" className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Airtel Money</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tigo" id="tigo" />
                      <Label htmlFor="tigo" className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Tigo Pesa</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Pay ${formatCurrency(total)}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
