
import React from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import BrandCard from "./BrandCard";

const marketplaceBrands = [
  {
    brandName: "EcoThreads Apparel",
    description: "Fashion that feels good and does good.",
    imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 5.2,
    purchaseLink: "https://bit.ly/sustainable-tshirts-aff",
  },
  {
    brandName: "GreenCommute Bikes",
    description: "Switch to a greener commute with our electric bikes.",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 150,
    purchaseLink: "https://amzn.to/3ZT5q9C",
  },
  {
    brandName: "SolarX Panels",
    description: "Renewable home energy, easy install, lasting impact.",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 210,
    purchaseLink: "https://shareasale.com/r.cfm?b=solar-panels",
  },
  {
    brandName: "TerraFoods Organics",
    description: "Organic groceries, planet-friendly delivery.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 1.5,
    purchaseLink: "https://amzn.to/3RuEcoT",
  },
  {
    brandName: "OceanClean Beauty",
    description: "Skincare made from ocean plastic waste.",
    imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 2.8,
    purchaseLink: "https://bit.ly/ocean-beauty-aff",
  },
  {
    brandName: "PlantPower Nutrition",
    description: "100% plant-based protein supplements.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 3.4,
    purchaseLink: "https://amzn.to/plant-protein",
  },
  {
    brandName: "EcoHome Solutions",
    description: "Smart home tech that saves energy and money.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 45,
    purchaseLink: "https://bit.ly/smart-home-eco",
  },
  {
    brandName: "ZeroWaste Store",
    description: "Plastic-free products for everyday life.",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 8.2,
    purchaseLink: "https://zerowaste.com/kelp",
  },
  {
    brandName: "GreenTech Gadgets",
    description: "Innovative tech powered by renewable energy.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 12.5,
    purchaseLink: "https://greentech.co/kelp-partners",
  },
  {
    brandName: "Sustainable Sneakers",
    description: "Footwear made from recycled ocean plastic.",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    offsetValue: 6.8,
    purchaseLink: "https://sustainable-shoes.com/kelp",
  }
];

const MarketplaceSection = () => (
  <div className="p-4">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
        <span className="text-2xl">💸</span>
        Marketplace
      </h2>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        View All
      </Button>
    </div>
    
    {/* Grid Slider Layout */}
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {marketplaceBrands.map((brand, index) => (
            <CarouselItem key={`${brand.brandName}-${index}`} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <div className="hover:scale-[1.02] transition-transform duration-200 animate-fade-in h-full">
                <BrandCard {...brand} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4" />
        <CarouselNext className="hidden sm:flex -right-4" />
      </Carousel>
    </div>

    {/* Mobile swipe indicator */}
    <div className="flex justify-center mt-3 sm:hidden">
      <div className="flex gap-1">
        {Array.from({ length: Math.ceil(marketplaceBrands.length / 2) }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        ))}
      </div>
    </div>
    
    <div className="text-xs text-muted-foreground mt-4 text-center">
      Some links may be affiliate and support green efforts 🌱
    </div>
  </div>
);

export default MarketplaceSection;
