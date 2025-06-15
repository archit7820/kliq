
import React from "react";
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
  <section className="bg-white p-4 rounded-2xl shadow animate-fade-in relative overflow-hidden">
    <div className="absolute left-3 top-2 text-2xl animate-spin-slow">💸</div>
    <h3 className="font-semibold text-lg mb-3 text-green-800 flex items-center gap-2">
      Offset Marketplace <span className="text-2xl -ml-1">🌍</span>
    </h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {marketplaceBrands.map((brand) => (
        <div
          key={brand.brandName}
          className="hover:scale-105 transition-transform duration-200 animate-fade-in"
        >
          <BrandCard {...brand} />
        </div>
      ))}
    </div>
    <div className="text-xs text-gray-400 mt-4">
      Some links may be affiliate and support green efforts 🌱
    </div>
  </section>
);

export default MarketplaceSection;

