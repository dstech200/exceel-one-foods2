"use client"

import { useEffect, useState } from "react"
import { Save, Bell, MapPin, CreditCard, Shield, Globe, Plus, Edit, Trash2 } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAdminStore } from "@/lib/admin-store"
import { useLocationStore } from "@/lib/store"
import type { BaseLocation } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { isAuthenticated } = useAdminStore()
  const { baseLocations, setBaseLocations } = useLocationStore()
  const router = useRouter()
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    // Restaurant Information
    restaurantName: "Exceel One Hotel",
    description: "Luxury dining experience in the heart of Dar es Salaam",
    address: "Msasani Peninsula, Dar es Salaam, Tanzania",
    phone: "+255 22 260 0123",
    email: "info@exceelonehotel.com",

    // Delivery Settings
    baseDeliveryFee: "2000",
    perKmFee: "500",
    maxDeliveryDistance: "15",
    estimatedPrepTime: "20",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,

    // Payment Settings
    clickpesaEnabled: true,
    mpesaEnabled: true,
    airtelMoneyEnabled: true,
    tigoPesaEnabled: true,

    // System Settings
    maintenanceMode: false,
    autoAcceptOrders: false,
    requireOrderConfirmation: true,
  })

  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<BaseLocation | null>(null)
  const [locationFormData, setLocationFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    deliveryRadius: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }
  }, [isAuthenticated, router])

  const handleSave = () => {
    // In production, this would save to your backend
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    })
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddLocation = () => {
    setEditingLocation(null)
    setLocationFormData({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      deliveryRadius: "",
    })
    setIsLocationDialogOpen(true)
  }

  const handleEditLocation = (location: BaseLocation) => {
    setEditingLocation(location)
    setLocationFormData({
      name: location.name,
      address: location.address,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      deliveryRadius: location.deliveryRadius.toString(),
    })
    setIsLocationDialogOpen(true)
  }

  const handleDeleteLocation = (locationId: string) => {
    const updatedLocations = baseLocations.filter((loc) => loc.id !== locationId)
    setBaseLocations(updatedLocations)
    toast({
      title: "Location Deleted",
      description: "Base location has been removed successfully",
    })
  }

  const handleLocationSubmit = () => {
    if (
      !locationFormData.name ||
      !locationFormData.address ||
      !locationFormData.latitude ||
      !locationFormData.longitude ||
      !locationFormData.deliveryRadius
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const locationData: BaseLocation = {
      id: editingLocation?.id || `loc-${Date.now()}`,
      name: locationFormData.name,
      address: locationFormData.address,
      latitude: Number.parseFloat(locationFormData.latitude),
      longitude: Number.parseFloat(locationFormData.longitude),
      deliveryRadius: Number.parseFloat(locationFormData.deliveryRadius),
      isActive: editingLocation?.isActive ?? true,
      createdAt: editingLocation?.createdAt || new Date(),
    }

    if (editingLocation) {
      const updatedLocations = baseLocations.map((loc) => (loc.id === editingLocation.id ? locationData : loc))
      setBaseLocations(updatedLocations)
      toast({
        title: "Location Updated",
        description: "Base location has been updated successfully",
      })
    } else {
      setBaseLocations([...baseLocations, locationData])
      toast({
        title: "Location Added",
        description: "New base location has been added successfully",
      })
    }

    setIsLocationDialogOpen(false)
  }

  const toggleLocationStatus = (locationId: string) => {
    const updatedLocations = baseLocations.map((loc) =>
      loc.id === locationId ? { ...loc, isActive: !loc.isActive } : loc,
    )
    setBaseLocations(updatedLocations)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your hotel settings and preferences</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restaurant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Hotel Information</span>
              </CardTitle>
              <CardDescription>Basic information about your hotel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Hotel Name</Label>
                <Input
                  id="restaurantName"
                  value={settings.restaurantName}
                  onChange={(e) => handleInputChange("restaurantName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Delivery Settings</span>
              </CardTitle>
              <CardDescription>Configure delivery fees and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseDeliveryFee">Base Delivery Fee (TZS)</Label>
                  <Input
                    id="baseDeliveryFee"
                    type="number"
                    value={settings.baseDeliveryFee}
                    onChange={(e) => handleInputChange("baseDeliveryFee", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perKmFee">Per KM Fee (TZS)</Label>
                  <Input
                    id="perKmFee"
                    type="number"
                    value={settings.perKmFee}
                    onChange={(e) => handleInputChange("perKmFee", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxDeliveryDistance">Max Delivery Distance (KM)</Label>
                  <Input
                    id="maxDeliveryDistance"
                    type="number"
                    value={settings.maxDeliveryDistance}
                    onChange={(e) => handleInputChange("maxDeliveryDistance", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedPrepTime">Prep Time (minutes)</Label>
                  <Input
                    id="estimatedPrepTime"
                    type="number"
                    value={settings.estimatedPrepTime}
                    onChange={(e) => handleInputChange("estimatedPrepTime", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified of new orders</p>
                </div>
                <Switch
                  checked={settings.orderAlerts}
                  onCheckedChange={(checked) => handleInputChange("orderAlerts", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when items are low in stock</p>
                </div>
                <Switch
                  checked={settings.lowStockAlerts}
                  onCheckedChange={(checked) => handleInputChange("lowStockAlerts", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Methods</span>
              </CardTitle>
              <CardDescription>Configure available payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ClickPesa Integration</Label>
                  <p className="text-sm text-muted-foreground">Enable ClickPesa payment gateway</p>
                </div>
                <Switch
                  checked={settings.clickpesaEnabled}
                  onCheckedChange={(checked) => handleInputChange("clickpesaEnabled", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vodacom M-Pesa</Label>
                  <p className="text-sm text-muted-foreground">Accept M-Pesa payments</p>
                </div>
                <Switch
                  checked={settings.mpesaEnabled}
                  onCheckedChange={(checked) => handleInputChange("mpesaEnabled", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Airtel Money</Label>
                  <p className="text-sm text-muted-foreground">Accept Airtel Money payments</p>
                </div>
                <Switch
                  checked={settings.airtelMoneyEnabled}
                  onCheckedChange={(checked) => handleInputChange("airtelMoneyEnabled", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tigo Pesa</Label>
                  <p className="text-sm text-muted-foreground">Accept Tigo Pesa payments</p>
                </div>
                <Switch
                  checked={settings.tigoPesaEnabled}
                  onCheckedChange={(checked) => handleInputChange("tigoPesaEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Base Locations Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Base Locations</span>
                </CardTitle>
                <CardDescription>Manage delivery base locations and coverage areas</CardDescription>
              </div>
              <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddLocation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingLocation ? "Edit Base Location" : "Add Base Location"}</DialogTitle>
                    <DialogDescription>
                      Configure a new base location for order fulfillment and delivery
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="locationName">Location Name</Label>
                      <Input
                        id="locationName"
                        value={locationFormData.name}
                        onChange={(e) => setLocationFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Main Branch, Msasani"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locationAddress">Address</Label>
                      <Textarea
                        id="locationAddress"
                        value={locationFormData.address}
                        onChange={(e) => setLocationFormData((prev) => ({ ...prev, address: e.target.value }))}
                        placeholder="Full address of the location"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={locationFormData.latitude}
                          onChange={(e) => setLocationFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                          placeholder="-6.7924"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={locationFormData.longitude}
                          onChange={(e) => setLocationFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                          placeholder="39.2083"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryRadius">Delivery Radius (KM)</Label>
                      <Input
                        id="deliveryRadius"
                        type="number"
                        value={locationFormData.deliveryRadius}
                        onChange={(e) => setLocationFormData((prev) => ({ ...prev, deliveryRadius: e.target.value }))}
                        placeholder="15"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleLocationSubmit}>
                      {editingLocation ? "Update Location" : "Add Location"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Radius</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {baseLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{location.address}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell>{location.deliveryRadius}km</TableCell>
                    <TableCell>
                      <Badge variant={location.isActive ? "default" : "secondary"}>
                        {location.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleLocationStatus(location.id)}>
                          <Switch checked={location.isActive} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditLocation(location)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {baseLocations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No base locations configured. Add your first location to start accepting orders.
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>System Settings</span>
            </CardTitle>
            <CardDescription>Advanced system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable ordering</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Accept Orders</Label>
                  <p className="text-sm text-muted-foreground">Automatically accept new orders</p>
                </div>
                <Switch
                  checked={settings.autoAcceptOrders}
                  onCheckedChange={(checked) => handleInputChange("autoAcceptOrders", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Confirmation</Label>
                  <p className="text-sm text-muted-foreground">Require manual order confirmation</p>
                </div>
                <Switch
                  checked={settings.requireOrderConfirmation}
                  onCheckedChange={(checked) => handleInputChange("requireOrderConfirmation", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
