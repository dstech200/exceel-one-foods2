"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, MoreHorizontal, Search, Loader2Icon } from "lucide-react"
import Image from "next/image"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useAdminStore, useMenuStore } from "@/lib/admin-store"
import { formatCurrency } from "@/lib/utils"
import type { MenuItem } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function MenuPage() {
  const { isAuthenticated } = useAdminStore()
  const { items, category, addItem, updateItem, deleteItem, toggleAvailability } = useMenuStore()
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    is_available: true,
  })
  const router = useRouter()
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set the preview image
      };
      reader.readAsDataURL(file); // Read the image as a data URL
    }
  };

  // Upload image to Supabase
  const uploadImage = async () => {
    if (!selectedImage) return;

    setUploading(true);
    const fileName = `${Date.now()}-${uuidv4()}.${selectedImage.name.split('.').pop()?.toLowerCase()}`; // Use unique filename to avoid conflicts
    try {
      const { data, error } = await supabase.storage
        .from('joto-foods') // Your bucket name
        .upload(fileName, selectedImage, {
          cacheControl: '3600', // Optional: Set cache control
          upsert: false, // Optional: Set to true to overwrite file with the same name
        });
      const publicURL = "https://xmuogagalwlwgdydrjmu.supabase.co/storage/v1/object/public/" + data?.fullPath

      if (error) throw error;
      return publicURL
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };


  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Filter items based on search and category
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, categoryFilter])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image_url: "",
      is_available: true,
    })
    setEditingItem(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const itemData = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      image_url: formData.image_url || "/placeholder.svg?height=250&width=400",
      is_available: formData.is_available,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (editingItem) {
      try {
        const imageUrl = await uploadImage();
        itemData.image_url = imageUrl as string || formData.image_url || "/placeholder.svg?height=250&width=400";
        updateItem(editingItem.id, itemData);
        toast({
          title: "Item Updated",
          description: `${formData.name} has been updated successfully`,
        });
      } catch {
        toast({
          title: "failed",
          description: `${formData.name} has not been updated to the menu`,
        })
      }
    } else {
      try {
        const imageUrl = await uploadImage();
        itemData.image_url = imageUrl as string || formData.image_url || "/placeholder.svg?height=250&width=400";
        await addItem(itemData)
        toast({
          title: "Item Added",
          description: `${formData.name} has been added to the menu`,
        })
      } catch {
        toast({
          title: "failed",
          description: `${formData.name} has not been added to the menu`,
        })
      }
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url,
      is_available: item.is_available,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (item: MenuItem) => {
    deleteItem(item.id)
    toast({
      title: "Item Deleted",
      description: `${item.name} has been removed from the menu`,
    })
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
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-muted-foreground">Add, edit, and manage your restaurant menu items</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update the menu item details below." : "Add a new item to your menu."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (TZS) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {category.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* image upload  */}
                  <div className="grid gap-2">
                    {/* <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    /> */}
                    {/* File input */}
                    <Label htmlFor="image">Image *</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="border p-2"
                    />

                    {/* Image preview 
                    {imagePreview && (
                      <div className="w-64 h-64 border border-gray-300">
                        <img src={imagePreview} alt="Image preview" className="w-full h-full object-cover" />
                      </div>
                    )}*/}

                    {/* Display loading state
                    {uploading && <p>Uploading...</p>}

                    {/* Display uploaded image */}
                    {/* {imageUrl && (
                      <div className="mt-4">
                        <h3>Uploaded Image:</h3>
                        <img src={imageUrl} alt="Uploaded" className="w-64 h-64 object-cover" />
                      </div>
                    )} */}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={formData.is_available}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_available: checked }))}
                    />
                    <Label htmlFor="available">Available</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button disabled={uploading} type="submit">{uploading && <Loader2Icon className="animate-spin" />}{editingItem ? "Update Item" : "Add Item"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{items.length}</div>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{items.filter((item) => item.is_available).length}</div>
              <p className="text-xs text-muted-foreground">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{items.filter((item) => !item.is_available).length}</div>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{category.length}</div>
              <p className="text-xs text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>Manage your restaurant menu items</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {category.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src={item.image_url.trimEnd() || "/placeholder.svg"}
                        alt={item.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAvailability(item.id)}>
                              <Switch className="mr-2 h-4 w-4" />
                              {item.is_available ? "Mark Unavailable" : "Mark Available"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">{formatCurrency(item.price)}</span>
                        <Badge variant={item.is_available ? "default" : "secondary"}>
                          {item.is_available ? "Available" :
                            <button onClick={() => toggleAvailability(item.id)}>
                              {!item.is_available && "Mark Available"}
                            </button>}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery || categoryFilter !== "all" ? "No items match your filters" : "No menu items yet"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
