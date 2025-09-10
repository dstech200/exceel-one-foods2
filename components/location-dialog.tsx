"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { OrderTypeSelector } from "@/components/order-type-selector"

export function LocationDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Set new location</Button>
      </DialogTrigger>
      <DialogContent className="pt-10 sm:max-w-[425px]">
        <OrderTypeSelector />
      </DialogContent>
    </Dialog>
  )
}
