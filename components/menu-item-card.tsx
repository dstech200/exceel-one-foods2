"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Plus, Minus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { MenuItem, SelectedCustomization, CustomizationOption } from "@/lib/types"
import { useCartStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCartStore()
  const { toast } = useToast()
  const [showCustomizations, setShowCustomizations] = useState(false)
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([])

  const cartItem = items.find((i) => i.id === item.id)
  const quantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    if (item.customizations && item.customizations.length > 0) {
      setShowCustomizations(true)
    } else {
      addItem(item)
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
      })
    }
  }

  const handleCustomizationChange = (customizationId: string, option: CustomizationOption, checked: boolean) => {
    const customization = item.customizations?.find((c) => c.id === customizationId)
    if (!customization) return

    setSelectedCustomizations((prev) => {
      const existing = prev.find((c) => c.customizationId === customizationId)

      if (customization.type === "single") {
        // Replace existing selection for single-choice customizations
        return [
          ...prev.filter((c) => c.customizationId !== customizationId),
          {
            customizationId,
            customizationName: customization.name,
            selectedOptions: checked ? [option] : [],
          },
        ]
      } else {
        // Handle multiple-choice customizations
        if (existing) {
          const updatedOptions = checked
            ? [...existing.selectedOptions, option]
            : existing.selectedOptions.filter((o) => o.id !== option.id)

          return prev.map((c) =>
            c.customizationId === customizationId ? { ...c, selectedOptions: updatedOptions } : c,
          )
        } else if (checked) {
          return [
            ...prev,
            {
              customizationId,
              customizationName: customization.name,
              selectedOptions: [option],
            },
          ]
        }
      }
      return prev
    })
  }

  const handleConfirmCustomizations = () => {
    // Check required customizations
    const missingRequired = item.customizations?.filter(
      (c) => c.required && !selectedCustomizations.find((sc) => sc.customizationId === c.id)?.selectedOptions.length,
    )

    if (missingRequired && missingRequired.length > 0) {
      toast({
        title: "Missing Required Options",
        description: `Please select options for: ${missingRequired.map((c) => c.name).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    addItem(
      item,
      selectedCustomizations.filter((c) => c.selectedOptions.length > 0),
    )
    setShowCustomizations(false)
    setSelectedCustomizations([])
    toast({
      title: "Added to cart",
      description: `${item.name} with customizations has been added to your cart`,
    })
  }

  const calculateCustomizationPrice = () => {
    return selectedCustomizations.reduce(
      (total, custom) => total + custom.selectedOptions.reduce((sum, option) => sum + option.price, 0),
      0,
    )
  }

  const totalPrice = item.price + calculateCustomizationPrice()

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
          <div className="relative">
            <Image
              src={item.image_url.trimEnd() || "/placeholder.svg"}
              alt={item.name}
              width={400}
              height={250}
              className="w-full h-48 object-cover"
            />
            {!item.is_available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
            {item.customizations && item.customizations.length > 0 && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90">
                  <Settings className="h-3 w-3 mr-1" />
                  Customizable
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
              <Badge variant="outline" className="ml-2 text-xs">
                {item.category}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">{formatCurrency(item.price)}</span>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            {quantity === 0 ? (
              <Button onClick={handleAddToCart} disabled={!item.is_available} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, quantity - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg mx-4">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      {/* Customization Dialog */}
      <Dialog open={showCustomizations} onOpenChange={setShowCustomizations}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize {item.name}</DialogTitle>
            <DialogDescription>Select your preferred options for this item</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {item.customizations?.map((customization) => (
              <div key={customization.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{customization.name}</h4>
                  {customization.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>

                {customization.type === "single" ? (
                  <RadioGroup
                    value={
                      selectedCustomizations.find((c) => c.customizationId === customization.id)?.selectedOptions[0]
                        ?.id || ""
                    }
                    onValueChange={(value) => {
                      const option = customization.options.find((o) => o.id === value)
                      if (option) {
                        handleCustomizationChange(customization.id, option, true)
                      }
                    }}
                  >
                    {customization.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-1 flex justify-between">
                          <span>{option.name}</span>
                          {option.price > 0 && (
                            <span className="text-primary font-medium">+{formatCurrency(option.price)}</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {customization.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={
                            selectedCustomizations
                              .find((c) => c.customizationId === customization.id)
                              ?.selectedOptions.some((o) => o.id === option.id) || false
                          }
                          onCheckedChange={(checked) =>
                            handleCustomizationChange(customization.id, option, checked as boolean)
                          }
                        />
                        <Label htmlFor={option.id} className="flex-1 flex justify-between">
                          <span>{option.name}</span>
                          {option.price > 0 && (
                            <span className="text-primary font-medium">+{formatCurrency(option.price)}</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Price:</span>
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomizations(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCustomizations}>Add to Cart - {formatCurrency(totalPrice)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
