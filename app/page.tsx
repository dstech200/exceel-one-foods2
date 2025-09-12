"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { MenuItemCard } from "@/components/menu-item-card"
import { MenuFilters } from "@/components/menu-filters"
import { OrderTypeSelector } from "@/components/order-type-selector"
import { HowToReceiveOrder } from "@/components/how-to-receive-order"
import { useAuth } from "@/components/auth-provider"
import { LoginDialog } from "@/components/login-dialog"
import { db } from "@/lib/database"
import type { MenuItem } from "@/lib/types"
import Image from 'next/image'
import { FoodSlide } from "@/components/food-slide-images"
import { useMenuStore } from "@/lib/admin-store"

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const { items } = useMenuStore()


  // Fetch menu items from Supabase
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true)
        const item: any = await db.getMenuItems()
        setMenuItems(item)
      } catch (err) {
        console.log("Error fetching menu items:", err)
        setError("Failed to load menu items")
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  const categories = useMemo(() => {
    return Array.from(new Set(menuItems.map((item) => item.category)))
  }, [menuItems])

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch && item.is_available
    })
  }, [menuItems, selectedCategory, searchQuery])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* How to Receive Your Order - Primary Focus */}
        {/*<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <HowToReceiveOrder />
        </motion.section> */}

        {/* Order Type Selection 
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <OrderTypeSelector />
        </motion.section>*/}

        {!user &&
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <LoginDialog />
              <div className="flex justify-center">
                <FoodSlide />
              </div>
            </div>
          </div>
        }

        {/* Menu Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Menu</h2>
            <div className="">
              <MenuFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive text-lg mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          )}

          {/* Menu Grid */}
          {!loading && !error && (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MenuItemCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-muted-foreground text-lg">No items found matching your criteria.</p>
            </motion.div>
          )}
        </motion.section>
      </main>
    </div>
  )
}
