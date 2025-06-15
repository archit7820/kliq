
import React from "react";
import LearnCard from "./LearnCard";

const learnContent = [
  {
    title: "What is a Carbon Footprint?",
    description: "Understand the total amount of greenhouse gases produced to support human activities.",
    imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    link: "https://www.nature.org/en-us/get-involved/how-to-help/carbon-footprint-calculator/",
  },
  {
    title: "Renewable Energy at Home",
    description: "Discover how solar panels and other renewables can reduce your home's carbon emissions.",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    link: "https://www.energy.gov/eere/solar/homeowners-guide-going-solar",
  },
  {
    title: "Sustainable Travel Tips",
    description: "Learn to explore the world while minimizing your environmental impact.",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
    link: "https://www.unwto.org/sustainable-development/sustainable-tourism-tips-for-travellers",
  },
];

const LearnSection = () => (
  <section className="bg-white p-4 rounded-2xl shadow animate-fade-in relative overflow-hidden">
    <div className="absolute right-3 top-2 text-xl animate-bounce">📖</div>
    <h3 className="font-semibold text-lg mb-3 text-blue-900 flex items-center gap-2">
      Learn <span className="text-xl">🧠</span>
    </h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {learnContent.map((item) => (
        <div key={item.title} className="hover:scale-105 transition-transform duration-200 animate-fade-in">
          <LearnCard {...item} />
        </div>
      ))}
    </div>
  </section>
);

export default LearnSection;

