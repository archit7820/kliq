
import React from "react";
import { Button } from "@/components/ui/button";
import BrandCard from "./BrandCard";

const marketplaceBrands = [
  {
    brandName: "EcoThreads Apparel",
    description: "Fashion that feels good and does good.",
    imageUrl: `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800`,
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
    
    <div className="space-y-3">
      {marketplaceBrands.slice(0, 2).map((brand) => (
        <div
          key={brand.brandName}
          className="hover:scale-[1.02] transition-transform duration-200 animate-fade-in"
        >
          <BrandCard {...brand} />
        </div>
      ))}
    </div>
    
    <div className="text-xs text-muted-foreground mt-4 text-center">
      Some links may be affiliate and support green efforts 🌱
    </div>
  </div>
);

export default MarketplaceSection;

