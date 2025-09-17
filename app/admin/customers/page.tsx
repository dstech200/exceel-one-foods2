"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, Mail, Phone, Calendar } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAdminStore, useOrderManagementStore } from "@/lib/admin-store"
import { formatCurrency } from "@/lib/utils"
import type { Order, CustomerInfo } from "@/lib/types"
import { useRouter } from "next/navigation"

interface CustomerData extends CustomerInfo {
  id: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: Date
  status: "active" | "inactive"
}

export default function CustomersPage() {
  const { currentUser, isAuthenticated } = useAdminStore()
  const { orders, setOrders } = useOrderManagementStore()
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }

    if (currentUser?.role !== "admin") {
      router.push("/admin")
      return
    }

    // Fetch orders and process customer data
    const fetchData = async () => {
      try {
        const ordersData: Order[] = await orders
        setOrders(ordersData)

        // Process customer data from orders
        const customerMap = new Map<string, CustomerData>()

        ordersData.forEach((order) => {
          const customerId = order.customer_info.email

          if (customerMap.has(customerId)) {
            const customer = customerMap.get(customerId)!
            customer.totalOrders += 1
            customer.totalSpent += order.total
            if (new Date(order.created_at) > customer.lastOrderDate) {
              customer.lastOrderDate = new Date(order.created_at)
            }
          } else {
            customerMap.set(customerId, {
              id: customerId,
              name: order.customer_info.name,
              phone: order.customer_info.phone,
              email: order.customer_info.email,
              totalOrders: 1,
              totalSpent: order.total,
              lastOrderDate: new Date(order.created_at),
              status: "active",
            })
          }
        })

        const customersArray = Array.from(customerMap.values())

        // Determine customer status based on last order date
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        customersArray.forEach((customer) => {
          customer.status = customer.lastOrderDate > thirtyDaysAgo ? "active" : "inactive"
        })

        setCustomers(customersArray)
      } catch (error) {
        console.error("Failed to fetch customer data:", error)
      }
    }

    fetchData()
  }, [isAuthenticated, router, setOrders])

  useEffect(() => {
    // Filter customers based on search
    let filtered = customers

    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredCustomers(filtered)
  }, [customers, searchQuery])

  if (!isAuthenticated) {
    return null
  }

  const activeCustomers = customers.filter((c) => c.status === "active").length
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
  const averageOrderValue =
    customers.length > 0 ? totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0) : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage and view customer information and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{customers.length}</div>
                  <p className="text-xs text-muted-foreground">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
              <p className="text-xs text-muted-foreground">Active Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
            </CardContent>
          </Card>
        </div>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
            <CardDescription>View and manage customer information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      {/* <AvatarImage src="/placeholder.svg" /> */}
                      <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{customer.name}</h3>
                        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                          {customer.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Last order: {customer.lastOrderDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(customer.totalSpent)}</div>
                    <div className="text-sm text-muted-foreground">{customer.totalOrders} orders</div>
                  </div>
                </motion.div>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No customers match your search" : "No customers yet"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
