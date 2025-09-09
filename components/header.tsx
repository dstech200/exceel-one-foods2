"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ShoppingCart, Moon, LogOut, Sun, MapPin, Menu, X, Hotel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore, useLocationStore } from "@/lib/store"
import { useLocation } from "@/components/location-provider"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { getItemCount, orderType } = useCartStore()
  const { location, deliveryInfo, dineInInfo } = useLocationStore()
  const { requestLocation, isLoading } = useLocation()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { email, role, user_metadata, last_sign_in_at } = user ? user: {};
  const { name, phone, email_verified, phone_verified } = user_metadata?user_metadata:{};

  const itemCount = getItemCount()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Hotel className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">Exceel One</span>
              <span className="text-xs text-muted-foreground leading-none">Hotel</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Menu
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
            <Link href="/my-orders" className="text-sm font-medium hover:text-primary transition-colors">
              Orders
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Location/Dine-in Info */}
            {orderType === "delivery" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={requestLocation}
                disabled={isLoading}
                className="hidden sm:flex items-center space-x-1"
              >
                <MapPin className="h-4 w-4" />
                <span className="text-xs">{location ? location.city : "Set Location"}</span>
              </Button>
            ) : (
              <div className="hidden sm:flex items-center space-x-1 text-xs">
                <Hotel className="h-4 w-4" />
                <span>{dineInInfo ? `${dineInInfo.type === "room" ? "Room" : "Table"} Service` : "Dine-in"}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/*user content*/}
            {user && 
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/userplaceholder.png" alt={name} />
                      <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              }

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t"
            >
              <nav className="flex flex-col space-y-4 py-4">
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                {orderType === "delivery" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      requestLocation()
                      setIsMenuOpen(false)
                    }}
                    disabled={isLoading}
                    className="justify-start"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {location ? location.city : "Set Location"}
                  </Button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order Type Info Bar */}
      {orderType === "delivery" && deliveryInfo && (
        <div className="bg-primary/10 border-b">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span>🚚 Delivery: {deliveryInfo.fee.toLocaleString()} TZS</span>
              <span>⏱️ {deliveryInfo.estimatedTime}</span>
              <span>📏 {deliveryInfo.distance}km away</span>
            </div>
          </div>
        </div>
      )}

      {orderType === "dine-in" && dineInInfo && (
        <div className="bg-primary/10 border-b">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span>🏨 {dineInInfo.type === "room" ? "Room Service" : "Restaurant Service"}</span>
              <span>📍 {dineInInfo.location}</span>
              {dineInInfo.type === "restaurant" && dineInInfo.tableNumber && (
                <span>🪑 Table {dineInInfo.tableNumber}</span>
              )}
              {dineInInfo.type === "room" && dineInInfo.roomNumber && <span>🚪 Room {dineInInfo.roomNumber}</span>}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
