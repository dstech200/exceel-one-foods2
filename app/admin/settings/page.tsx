"use client"

import { useEffect, useState } from "react"
import { Save, Bell, MapPin, CreditCard, Loader2Icon, Shield, Globe, Plus, Edit, Trash2 } from "lucide-react"
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
import { db } from "@/lib/database"


type HotelInfo = {
  id: string;
  hotel_name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  base_delivery_fee: number;
  per_km_fee: number;
  max_delivery_distance: number;
  estimated_prep_time: number;
  email_notifications: boolean;
  order_alerts: boolean;
  low_stock_alerts: boolean;
  clickpesa_enabled: boolean;
  mpesa_enabled: boolean;
  airtel_money_enabled: boolean;
  tigo_pesa_enabled: boolean;
  maintenance_mode: boolean;
  auto_accept_orders: boolean;
  require_order_confirmation: boolean;
  sms_notifications: boolean;
}

export default function SettingsPage() {
  const { isAuthenticated, currentUser } = useAdminStore()
  const { baseLocations, setBaseLocations, useToggleLocationStatus, useLocationSubmit, useEditLocation, useDeleteLocation } = useLocationStore()
  const router = useRouter()
  const { toast } = useToast()
  const [settings, setSettings] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState(false)


  useEffect(() => {
    // Async function to fetch the settings data from your db
    async function fetchSettings() {
      try {
        // Fetch the data from your db
        const data: any = await db.getHotelInformation();
        const settingItems: any = data[0]

        // Update the state with the fetched settings data
        setSettings({
          id: settingItems?.id,
          hotel_name: settingItems?.hotel_name,
          description: settingItems?.description,
          address: settingItems?.address,
          phone: settingItems?.phone,
          email: settingItems?.email,
          // Delivery Settings
          base_delivery_fee: settingItems?.base_delivery_fee,
          per_km_fee: settingItems?.per_km_fee,
          max_delivery_distance: settingItems?.max_delivery_distance,
          estimated_prep_time: settingItems?.estimated_prep_time,
          // Notification Settings
          email_notifications: settingItems?.email_notifications,
          sms_notifications: settingItems?.sms_notifications,
          order_alerts: settingItems?.order_alerts,
          low_stock_alerts: settingItems?.low_stock_alerts,
          clickpesa_enabled: settingItems?.clickpesa_enabled,
          mpesa_enabled: settingItems?.mpesa_enabled,
          airtel_money_enabled: settingItems?.airtel_money_enabled,
          tigo_pesa_enabled: settingItems?.tigo_pesa_enabled,
          maintenance_mode: settingItems?.maintenance_mode,
          auto_accept_orders: settingItems?.auto_accept_orders,
          require_order_confirmation: settingItems?.require_order_confirmation
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);  // Once fetching is done, set loading to false
      }
    };

    fetchSettings();  // Call the async function when the component mounts
  }, []);  // Empty dependency array to run effect only once


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

    if (currentUser?.role !== "admin") {
      router.push("/admin")
      return
    }

  }, [isAuthenticated, router])

  const handleSave = () => {
    // In production, this would save to your backend
    setSaveLoading(true)
    async function save() {
      try {
        const update = await db.updateHotelInformation(settings.id, settings)
        toast({
          title: "Setting Saved",
          description: "Settings have been saved successfully",
        })
        update && console.log("successfull updated the settings")
      } catch {
        toast({
          title: "errror when saving",
          description: "Unexpected error has occured when savingthe setting",
          variant: "destructive",
        })
      } finally {
        setSaveLoading(false)
      }
    }
    save()

  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev: any) => ({
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

    const deleLocation = async () => {
      await useDeleteLocation(locationId)
      const updatedLocations = baseLocations.filter((loc) => loc.id !== locationId)
      setBaseLocations(updatedLocations)
      toast({
        title: "Location Deleted",
        description: "Base location has been removed successfully",
      })
    }

    deleLocation()

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
      id: editingLocation?.id,
      name: locationFormData.name,
      address: locationFormData.address,
      latitude: locationFormData.latitude,
      longitude: locationFormData.longitude,
      deliveryRadius: Number.parseFloat(locationFormData.deliveryRadius),
      isActive: editingLocation?.isActive ?? true,
      createdAt: editingLocation?.createdAt || new Date(),
    }

    if (editingLocation) {

      const editLocation = async () => {
        try {
          // Call the API to update location in the DB
          await useEditLocation(editingLocation.id, locationData);

          // Update the state locally
          const updatedLocations = baseLocations.map((loc) => (loc.id === editingLocation.id ? locationData : loc))
          setBaseLocations(updatedLocations)

          // Success toast
          toast({
            title: "Location Updated",
            description: "Base location has been updated successfully",
          });
        } catch (error) {
          // Error toast
          toast({
            title: "Update Failed",
            description: "Something went wrong while updating the location.",
            variant: "destructive",
          });
          console.error("Error updating location:", error);
        }
      };

      editLocation()

    } else {
      const addBaseLocation = async () => {
        try {
          const { id, ...locationWithoutId } = locationData;

          // Wait for location data to be submitted
          await useLocationSubmit(locationWithoutId);

          setBaseLocations([...baseLocations, locationData])
          // Update the baseLocations state

          // Show success toast
          toast({
            title: "Location Added",
            description: "New base location has been added successfully",
          });
        } catch (error) {
          // Handle errors here if location submission fails
          toast({
            title: "Error",
            description: "There was an issue adding the location",
            variant: "destructive",
          });
        }

      };

      // Call the function
      addBaseLocation();

    }
    setIsLocationDialogOpen(false)
  }

  const toggleLocationStatus = async (locationId: string) => {
    // Create an array of promises for async status updates
    const updatedLocations = await Promise.all(
      baseLocations.map(async (loc) => {
        if (loc.id === locationId) {
          // Toggle the status in the DB and get the updated value
          await useToggleLocationStatus(locationId, !loc.isActive);

          // Return the updated location with toggled `isActive`
          return { ...loc, isActive: !loc.isActive };
        }
        return loc;  // Return the location unchanged if IDs don't match
      })
    );

    // After all locations are updated, set the new state
    setBaseLocations(updatedLocations);
  };



  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
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
          <Button disabled={saveLoading} onClick={handleSave}>
            {saveLoading ? <Loader2Icon className="animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saveLoading ? "Saving Changes" : "Save changes"}
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
                <Label htmlFor="hotel_name">Hotel Name</Label>
                <Input
                  id="hotel_name"
                  value={settings.hotel_name}
                  onChange={(e) => handleInputChange("hotel_name", e.target.value)}
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
                  <Label htmlFor="base_delivery_fee">Base Delivery Fee (TZS)</Label>
                  <Input
                    id="base_delivery_fee"
                    type="number"
                    value={settings.base_delivery_fee}
                    onChange={(e) => handleInputChange("base_delivery_fee", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="per_km_fee">Per KM Fee (TZS)</Label>
                  <Input
                    id="per_km_fee"
                    type="number"
                    value={settings.per_km_fee}
                    onChange={(e) => handleInputChange("per_km_fee", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_delivery_distance">Max Delivery Distance (KM)</Label>
                  <Input
                    id="max_delivery_distance"
                    type="number"
                    value={settings.max_delivery_distance}
                    onChange={(e) => handleInputChange("max_delivery_distance", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_prep_time">Prep Time (minutes)</Label>
                  <Input
                    id="estimated_prep_time"
                    type="number"
                    value={settings.estimated_prep_time}
                    onChange={(e) => handleInputChange("estimated_prep_time", e.target.value)}
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
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleInputChange("email_notifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.sms_notifications}
                  onCheckedChange={(checked) => handleInputChange("sms_notifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified of new orders</p>
                </div>
                <Switch
                  checked={settings.order_alerts}
                  onCheckedChange={(checked) => handleInputChange("order_alerts", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when items are low in stock</p>
                </div>
                <Switch
                  checked={settings.low_stock_alerts}
                  onCheckedChange={(checked) => handleInputChange("low_stock_alerts", checked)}
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
                  checked={settings.clickpesa_enabled}
                  onCheckedChange={(checked) => handleInputChange("clickpesa_enabled", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vodacom M-Pesa</Label>
                  <p className="text-sm text-muted-foreground">Accept M-Pesa payments</p>
                </div>
                <Switch
                  checked={settings.mpesa_enabled}
                  onCheckedChange={(checked) => handleInputChange("mpesa_enabled", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Airtel Money</Label>
                  <p className="text-sm text-muted-foreground">Accept Airtel Money payments</p>
                </div>
                <Switch
                  checked={settings.airtel_money_enabled}
                  onCheckedChange={(checked) => handleInputChange("airtel_money_enabled", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tigo Pesa</Label>
                  <p className="text-sm text-muted-foreground">Accept Tigo Pesa payments</p>
                </div>
                <Switch
                  checked={settings.tigo_pesa_enabled}
                  onCheckedChange={(checked) => handleInputChange("tigo_pesa_enabled", checked)}
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
                      {location.latitude}, {location.longitude}
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
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => handleInputChange("maintenance_mode", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Accept Orders</Label>
                  <p className="text-sm text-muted-foreground">Automatically accept new orders</p>
                </div>
                <Switch
                  checked={settings.auto_accept_orders}
                  onCheckedChange={(checked) => handleInputChange("auto_accept_orders", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Confirmation</Label>
                  <p className="text-sm text-muted-foreground">Require manual order confirmation</p>
                </div>
                <Switch
                  checked={settings.require_order_confirmation}
                  onCheckedChange={(checked) => handleInputChange("require_order_confirmation", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
