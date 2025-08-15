
import React from "react";
import EnhancedImpactDashboard from "@/components/EnhancedImpactDashboard";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ImpactDashboardPage = () => (
  <div className="min-h-screen bg-background">
    {/* Mobile-optimized header */}
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
          <Link to="/profile" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Profile</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-1.5 bg-primary/20 rounded-full flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-lg md:text-xl font-bold truncate">
            Your Impact Dashboard
          </h1>
        </div>
      </div>
    </div>

    {/* Main content with proper mobile padding */}
    <div className="pb-20 md:pb-8 pt-4">
      <div className="max-w-4xl mx-auto">
        <EnhancedImpactDashboard />
      </div>
    </div>
  </div>
);

export default ImpactDashboardPage;
