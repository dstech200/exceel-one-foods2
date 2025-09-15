"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

const foodImages = [
  {
    key: "5e74db68-e3d0-4ffc-a2cb-478712374dc3",
    url: "/foods/5e74db68-e3d0-4ffc-a2cb-478712374dc3.jpeg"
  },
  {
    key: "7a974c30-8c18-444d-97c3-46ed99fda29c",
    url: "/foods/7a974c30-8c18-444d-97c3-46ed99fda29c.jpeg"
  },
  {
    key: "8c6a3cd0-1ca3-40e7-a110-499aa98938bd",
    url: "/foods/8c6a3cd0-1ca3-40e7-a110-499aa98938bd.jpeg"
  },
  {
    key: "crack-burgers",
    url: "/foods/crack burgers -.jpeg"
  },
  {
    key: "design-inspiracao",
    url: "/foods/tydytujyfiuy756756e65dytfjyvhgcrd4.jpeg"
  },
  {
    key: "red-velvet-strawberry-cheesecake",
    url: "/foods/Red Velvet Strawberry Cheesecake ❤️🍰🍓….jpeg"
  },
  {
    key: "seasoned-beef",
    url: "/foods/tryhtguyuf64554687987yhfrtxrgd.jpeg"
  }
];

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function FoodSlide() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, })
  )

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[plugin.current]}
      className="w-full pt-5 max-w-xs"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {foodImages.map((item, index) => (
          <CarouselItem key={index}>
            <div>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <div className="w-full h-full overflow-hidden">
                    <img
                      src={item.url}
                      alt={`Food item ${index + 1}`}
                      className="object-cover w-full rounded-lg h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
