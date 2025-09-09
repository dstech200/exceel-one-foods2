"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Hotel, MapPin, Clock, CheckCircle, Phone } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
  {
    icon: Hotel,
    title: "Choose Service Type",
    description: "Select between room service, restaurant dining, or delivery",
    badge: "Step 1",
  },
  {
    icon: MapPin,
    title: "Provide Location",
    description: "Enter your room number, table, or delivery address",
    badge: "Step 2",
  },
  {
    icon: CheckCircle,
    title: "Place Your Order",
    description: "Browse menu, customize items, and confirm your order",
    badge: "Step 3",
  },
  {
    icon: Clock,
    title: "Track Progress",
    description: "Monitor your order status in real-time",
    badge: "Step 4",
  },
  {
    icon: Truck,
    title: "Receive & Confirm",
    description: "Get your order and confirm receipt in the app",
    badge: "Step 5",
  },
]

export function HowToReceiveOrder() {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl md:text-3xl font-bold">How to Receive Your Order</CardTitle>
        <CardDescription className="text-lg">
          Follow these simple steps to get your food delivered quickly and efficiently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center space-y-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <Badge className="absolute -top-2 -right-2 text-xs">{step.badge}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base mb-2">{step.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Contact Information */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Support: +255 123 456 789</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Service Hours: 6:00 AM - 11:00 PM</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
