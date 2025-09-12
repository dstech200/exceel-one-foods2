"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { db } from "@/lib/database"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { DatabaseOrder } from "@/lib/database"
import { Clock, CheckCircle, UtensilsCrossed, Truck, X, MapPin, RefreshCw } from "lucide-react"

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: UtensilsCrossed,
  ready: CheckCircle,
  delivered: Truck,
  cancelled: X,
}

export default function PorterDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<DatabaseOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<DatabaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ready")

  useEffect(() => {
    if (!authLoading && !user) {
      console.log("user data" + JSON.stringify(user))
      router.push("/")
      return
    }

    // Check if user has porter role
    if (user && user.user_metadata?.role !== "porter") {
      console.log("user data" + JSON.stringify(user))
      //router.push("/")
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.user_metadata?.role === "porter") {
      fetchPorterOrders()
    }
  }, [user])

  useEffect(() => {
    // Filter orders based on search and status
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer_info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer_info.phone.includes(searchQuery),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchQuery, statusFilter])

  const fetchPorterOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const porterOrders = await db.getPorterOrders()
      setOrders(porterOrders)
    } catch (err) {
      console.error("Error fetching porter orders:", err)
      setError("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await db.updateOrderStatusByPorter(orderId, newStatus, user?.id || "")

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Order Updated",
          description: `Order status updated to ${newStatus}`,
        })
        // Refresh orders
        await fetchPorterOrders()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

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

  if (!user || user.user_metadata?.role !== "porter") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Porter Dashboard</h1>
            <p className="text-muted-foreground">Manage deliveries and update order statuses</p>
          </div>
          <Button onClick={fetchPorterOrders} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchPorterOrders}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orders.filter((o) => o.status === "ready").length}</div>
              <p className="text-xs text-muted-foreground">Ready for Delivery</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orders.filter((o) => o.status === "delivered").length}</div>
              <p className="text-xs text-muted-foreground">Delivered Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {orders.filter((o) => o.status === "delivered" && !o.receipt_confirmed).length}
              </div>
              <p className="text-xs text-muted-foreground">Pending Confirmation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Management</CardTitle>
            <CardDescription>View and update order statuses for delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="ready">Ready for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const StatusIcon = statusIcons[order.status as keyof typeof statusIcons]
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer_info.name}</div>
                            <div className="text-sm text-muted-foreground">{order.customer_info.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">
                              {order.order_type === "delivery"
                                ? order.delivery_address
                                : `${order.dine_in_info?.location} ${order.dine_in_info?.room ? `- Room ${order.dine_in_info.room}` : ""
                                } ${order.dine_in_info?.table ? `- Table ${order.dine_in_info.table}` : ""}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.status === "ready" && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, "delivered")}
                              className="mr-2"
                            >
                              Mark Delivered
                            </Button>
                          )}
                          {order.status === "delivered" && !order.receipt_confirmed && (
                            <Badge variant="secondary">Awaiting Confirmation</Badge>
                          )}
                          {order.status === "delivered" && order.receipt_confirmed && (
                            <Badge variant="outline">Confirmed</Badge>
                          )}
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || statusFilter !== "all" ? "No orders match your filters" : "No orders available"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
