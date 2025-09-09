"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Truck, Hotel, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCartStore, useLocationStore } from "@/lib/store"
import { useLocation } from "@/components/location-provider"
import type { DineInInfo } from "@/lib/types"

export function OrderTypeSelector() {
  const { orderType, setOrderType } = useCartStore()
  const { setDineInInfo, dineInInfo } = useLocationStore()
  const { requestLocation, isLoading } = useLocation()
  const [showDineInForm, setShowDineInForm] = useState(false)
  const [dineInData, setDineInData] = useState<DineInInfo>({
    type: "restaurant",
    location: "",
    tableNumber: "",
    roomNumber: "",
    floor: "",
    section: "",
  })

  const handleOrderTypeChange = (type: "delivery" | "dine-in") => {
    setOrderType(type)
    if (type === "delivery") {
      setShowDineInForm(false)
      requestLocation()
    } else {
      setShowDineInForm(true)
    }
  }

  const handleDineInSubmit = () => {
    const info: DineInInfo = {
      type: dineInData.type,
      location:
        dineInData.type === "room"
          ? `Floor ${dineInData.floor}, Room ${dineInData.roomNumber}`
          : `${dineInData.section}, Table ${dineInData.tableNumber}`,
      ...(dineInData.type === "room"
        ? { roomNumber: dineInData.roomNumber, floor: dineInData.floor }
        : { tableNumber: dineInData.tableNumber, section: dineInData.section }),
    }
    setDineInInfo(info)
    setShowDineInForm(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Utensils className="h-5 w-5" />
            <span>How would you like to receive your order?</span>
          </CardTitle>
          <CardDescription>Choose between delivery or dine-in service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-colors ${
                  orderType === "delivery" ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => handleOrderTypeChange("delivery")}
              >
                <CardContent className="p-6 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Delivery</h3>
                  <p className="text-sm text-muted-foreground">Get your food delivered to your location</p>
                  <p className="text-xs text-muted-foreground mt-2">Delivery fee applies based on distance</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-colors ${
                  orderType === "dine-in" ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => handleOrderTypeChange("dine-in")}
              >
                <CardContent className="p-6 text-center">
                  <Hotel className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Dine-in</h3>
                  <p className="text-sm text-muted-foreground">
                    Enjoy your meal at the hotel restaurant or room service
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">No delivery fee</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Dine-in Location Form */}
      {showDineInForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Dine-in Details</CardTitle>
              <CardDescription>Please specify your location within the hotel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Service Type</Label>
                <RadioGroup
                  value={dineInData.type}
                  onValueChange={(value: "room" | "restaurant") => setDineInData((prev) => ({ ...prev, type: value }))}
                  className="flex space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="restaurant" id="restaurant" />
                    <Label htmlFor="restaurant">Restaurant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="room" id="room" />
                    <Label htmlFor="room">Room Service</Label>
                  </div>
                </RadioGroup>
              </div>

              {dineInData.type === "restaurant" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="section">Restaurant Section</Label>
                    <Select
                      value={dineInData.section}
                      onValueChange={(value) => setDineInData((prev) => ({ ...prev, section: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main-dining">Main Dining Area</SelectItem>
                        <SelectItem value="terrace">Terrace</SelectItem>
                        <SelectItem value="private-dining">Private Dining</SelectItem>
                        <SelectItem value="bar-area">Bar Area</SelectItem>
                        <SelectItem value="poolside">Poolside</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input
                      id="tableNumber"
                      placeholder="e.g., 12"
                      value={dineInData.tableNumber}
                      onChange={(e) => setDineInData((prev) => ({ ...prev, tableNumber: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="floor">Floor</Label>
                    <Select
                      value={dineInData.floor}
                      onValueChange={(value) => setDineInData((prev) => ({ ...prev, floor: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ground">Ground Floor</SelectItem>
                        <SelectItem value="1st">1st Floor</SelectItem>
                        <SelectItem value="2nd">2nd Floor</SelectItem>
                        <SelectItem value="3rd">3rd Floor</SelectItem>
                        <SelectItem value="4th">4th Floor</SelectItem>
                        <SelectItem value="5th">5th Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      placeholder="e.g., 205"
                      value={dineInData.roomNumber}
                      onChange={(e) => setDineInData((prev) => ({ ...prev, roomNumber: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleDineInSubmit}
                className="w-full"
                disabled={
                  dineInData.type === "restaurant"
                    ? !dineInData.section || !dineInData.tableNumber
                    : !dineInData.floor || !dineInData.roomNumber
                }
              >
                Confirm Location
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Current Selection Display */}
      {orderType === "dine-in" && dineInInfo && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Hotel className="h-4 w-4 text-primary" />
              <span className="font-medium">{dineInInfo.type === "room" ? "Room Service" : "Restaurant Service"}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm">{dineInInfo.location}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowDineInForm(true)} className="ml-auto">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
