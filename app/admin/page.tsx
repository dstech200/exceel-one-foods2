"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Users, ShoppingBag, DollarSign, Clock, RefreshCw } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/lib/admin-store"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useRealTimeOrders } from "@/hooks/use-real-time-orders"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  averageOrderValue: number
  todayRevenue: number
}

export default function AdminDashboard() {
  const { isAuthenticated, currentUser } = useAdminStore()
  const { orders, loading, error, refreshOrders } = useRealTimeOrders()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    todayRevenue: 0,
  })
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin/login")
      return
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (orders && orders.length > 0) {
      calculateStats(orders)
    }
  }, [orders])

  const calculateStats = (ordersData: any[]) => {
    try {
      const validOrders = ordersData.filter((order) => order && typeof order === "object")

      const totalRevenue = validOrders.reduce((sum, order) => {
        const total = order.total || order.total_amount || 0
        return sum + (typeof total === "number" ? total : 0)
      }, 0)

      const totalOrders = validOrders.length
      const pendingOrders = validOrders.filter((order) => order.status === "pending").length
      const completedOrders = validOrders.filter(
        (order) => order.status === "delivered" || order.status === "completed",
      ).length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Today's revenue
      const today = new Date().toDateString()
      const todayRevenue = validOrders
        .filter((order) => {
          const orderDate = order.created_at || order.createdAt
          if (!orderDate) return false
          return new Date(orderDate).toDateString() === today
        })
        .reduce((sum, order) => {
          const total = order.total || order.total_amount || 0
          return sum + (typeof total === "number" ? total : 0)
        }, 0)

      setStats({
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        averageOrderValue,
        todayRevenue,
      })
    } catch (error) {
      console.error("Error calculating stats:", error)
      // Set default stats on error
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        todayRevenue: 0,
      })
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const recentOrders = orders?.slice(0, 5) || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{currentUser?.name ? `, ${currentUser.name}` : ""}! Here's what's happening with your restaurant
              today.
            </p>
          </div>
          <Button onClick={refreshOrders} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <span className="text-sm">Error loading dashboard data: {error}</span>
                <Button onClick={refreshOrders} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% from last month
                  </span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2% from last month
                  </span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Orders awaiting processing</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
                <p className="text-xs text-muted-foreground">Per order value</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading orders...</span>
                  </div>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => {
                    const orderId = order?.id || "Unknown"
                    const customerName = order?.customer_name || order?.customer_info?.name || "Unknown Customer"
                    const orderTotal = order?.total || order?.total_amount || 0
                    const orderStatus = order?.status || "unknown"
                    const createdAt = order?.created_at || order?.createdAt
                    const itemCount = order?.order_items?.length || order?.items?.length || 0

                    return (
                      <div key={orderId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              #{typeof orderId === "string" ? orderId.split("-")[1] || orderId.slice(-6) : orderId}
                            </span>
                            <Badge
                              variant={
                                orderStatus === "delivered" || orderStatus === "completed"
                                  ? "default"
                                  : orderStatus === "pending"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {orderStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{customerName}</p>
                          <p className="text-xs text-muted-foreground">{itemCount} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(orderTotal)}</p>
                          <p className="text-xs text-muted-foreground">
                            {createdAt ? new Date(createdAt).toLocaleDateString() : "Unknown date"}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Order Completion Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Today's Revenue</span>
                  <span className="text-sm font-semibold">{formatCurrency(stats.todayRevenue)}</span>
                </div>
                <Progress value={stats.todayRevenue > 0 ? 75 : 0} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm text-muted-foreground">4.8/5.0</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">98%</p>
                    <p className="text-xs text-muted-foreground">On-time Delivery</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">4.2</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
