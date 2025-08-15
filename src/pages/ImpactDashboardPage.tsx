
import React from "react";
import EnhancedImpactDashboard from "@/components/EnhancedImpactDashboard";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ImpactDashboardPage = () => (
  <div className="min-h-screen bg-background">
    {/* Mobile-first header */}
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
      <div className="flex items-center gap-2 p-3">
        <Button variant="ghost" size="sm" asChild className="flex-shrink-0 h-8 w-8 p-0 rounded-full">
          <Link to="/profile" className="flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-1 bg-primary/20 rounded-full flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate">
              Impact Dashboard
            </h1>
            <p className="text-xs text-muted-foreground hidden xs:block">
              Track your environmental impact
            </p>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile-optimized content with minimal padding */}
    <div className="p-3 pb-20">
      <EnhancedImpactDashboard />
    </div>
  </div>
);

export default ImpactDashboardPage;
