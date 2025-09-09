"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Eye,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  UtensilsCrossed,
  Truck,
  X,
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAdminStore } from "@/lib/admin-store"
import { formatCurrency } from "@/lib/utils"
import type { DatabaseOrder } from "@/lib/database"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useRealTimeOrders } from "@/hooks/use-real-time-orders"

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: UtensilsCrossed,
  ready: CheckCircle,
  delivered: Truck,
  cancelled: X,
}

export default function OrdersPage() {
  const { isAuthenticated } = useAdminStore()
  const { orders, loading, error, refreshOrders } = useRealTimeOrders()
  const [filteredOrders, setFilteredOrders] = useState<DatabaseOrder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<DatabaseOrder | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Filter orders based on search and status
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Order Updated",
          description: `Order status changed to ${newStatus}`,
        })
        // Refresh orders to get latest data
        await refreshOrders()
      } else {
        throw new Error("Failed to update order")
      }
    } catch (error) {
      toast({
        title: "Update Failed",
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

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Error Loading Orders</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={refreshOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">Manage and track all customer orders</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={refreshOrders}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orders.filter((o) => o.status === "preparing").length}</div>
              <p className="text-xs text-muted-foreground">Preparing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orders.filter((o) => o.status === "ready").length}</div>
              <p className="text-xs text-muted-foreground">Ready</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orders.filter((o) => o.status === "delivered").length}</div>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>View and manage all customer orders in real-time</CardDescription>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orders Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
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
                          <Badge variant="outline">{order.order_type}</Badge>
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
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                                  <DialogDescription>
                                    Order placed on {new Date(order.created_at).toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold">Customer Information</h4>
                                        <p>{selectedOrder.customer_info.name}</p>
                                        <p>{selectedOrder.customer_info.phone}</p>
                                        {selectedOrder.customer_info.email && (
                                          <p>{selectedOrder.customer_info.email}</p>
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="font-semibold">Order Information</h4>
                                        <p>Type: {selectedOrder.order_type}</p>
                                        <p>Payment: {selectedOrder.payment_method}</p>
                                        <p>Status: {selectedOrder.status}</p>
                                      </div>
                                    </div>

                                    {selectedOrder.order_type === "delivery" && selectedOrder.delivery_address && (
                                      <div>
                                        <h4 className="font-semibold">Delivery Address</h4>
                                        <p>{selectedOrder.delivery_address}</p>
                                      </div>
                                    )}

                                    {selectedOrder.order_type === "dine-in" && selectedOrder.dine_in_info && (
                                      <div>
                                        <h4 className="font-semibold">Dine-in Information</h4>
                                        <p>{selectedOrder.dine_in_info.location}</p>
                                        {selectedOrder.dine_in_info.room && (
                                          <p>Room: {selectedOrder.dine_in_info.room}</p>
                                        )}
                                        {selectedOrder.dine_in_info.table && (
                                          <p>Table: {selectedOrder.dine_in_info.table}</p>
                                        )}
                                      </div>
                                    )}

                                    <div>
                                      <h4 className="font-semibold">Order Items</h4>
                                      <div className="space-y-2">
                                        {selectedOrder.order_items?.map((item, index) => (
                                          <div key={index} className="flex justify-between">
                                            <span>
                                              {item.quantity}x {item.item_name}
                                            </span>
                                            <span>{formatCurrency(item.item_price * item.quantity)}</span>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between font-semibold">
                                          <span>Total</span>
                                          <span>{formatCurrency(selectedOrder.total)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "confirmed")}>
                                  Mark as Confirmed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "preparing")}>
                                  Mark as Preparing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "ready")}>
                                  Mark as Ready
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "delivered")}>
                                  Mark as Delivered
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleStatusChange(order.id, "cancelled")}
                                >
                                  Cancel Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || statusFilter !== "all" ? "No orders match your filters" : "No orders yet"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
