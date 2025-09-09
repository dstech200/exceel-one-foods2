"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Phone, Mail, Users, Award, Utensils, Wifi } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: Utensils,
      title: "Exquisite Cuisine",
      description: "Our chefs craft exceptional dishes using the finest local and international ingredients.",
    },
    {
      icon: Users,
      title: "Professional Service",
      description: "Our dedicated staff ensures every guest receives personalized attention and care.",
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Recognized for excellence in hospitality and culinary innovation in Tanzania.",
    },
    {
      icon: Wifi,
      title: "Modern Amenities",
      description: "Enjoy complimentary WiFi, air conditioning, and modern facilities throughout the hotel.",
    },
  ]

  const stats = [
    { number: "50+", label: "Delicious Dishes" },
    { number: "100+", label: "Happy Guests Daily" },
    { number: "15+", label: "Years of Excellence" },
    { number: "24/7", label: "Room Service" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-3xl -z-10" />
            <div className="py-12 px-6">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                About Exceel One Hotel
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Where luxury meets comfort, and every meal tells a story of culinary excellence.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Story Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Established in 2008, Exceel One Hotel has been a beacon of hospitality excellence in Dar es Salaam.
                  Located in the prestigious Msasani Peninsula, we offer our guests an unparalleled dining experience
                  that combines traditional Tanzanian flavors with international cuisine.
                </p>
                <p>
                  Our commitment to quality extends beyond our kitchen to every aspect of your stay. From our elegantly
                  appointed rooms to our world-class restaurant, every detail is designed to exceed your expectations.
                </p>
                <p>
                  Whether you're joining us for a business lunch, romantic dinner, or celebrating a special occasion,
                  our team is dedicated to creating memorable experiences that will keep you coming back.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Utensils className="h-12 w-12 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">15+ Years</h3>
                  <p className="text-muted-foreground">of Culinary Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Exceel One Hotel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Location & Hours */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Location
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Msasani Peninsula</p>
                  <p>Plot No. 123, Haile Selassie Road</p>
                  <p>Dar es Salaam, Tanzania</p>
                  <div className="pt-4">
                    <Badge variant="secondary">Prime Location</Badge>
                    <Badge variant="secondary" className="ml-2">
                      Ocean View
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Operating Hours
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Restaurant:</span>
                    <span>6:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room Service:</span>
                    <span>24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bar:</span>
                    <span>5:00 PM - 2:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Breakfast:</span>
                    <span>6:00 AM - 10:00 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Contact Info */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <Card className="p-8 text-center bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-0">
              <h3 className="text-2xl font-bold mb-6">Ready to Experience Excellence?</h3>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+255 22 260 0123</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>info@exceelonehotel.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  )
}
