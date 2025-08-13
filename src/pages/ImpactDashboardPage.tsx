
import React from "react";
import EnhancedImpactDashboard from "@/components/EnhancedImpactDashboard";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ImpactDashboardPage = () => (
  <div className="min-h-screen bg-background py-8 px-4">
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/profile" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1 text-center">Your Full Impact Dashboard</h1>
      </div>
      <EnhancedImpactDashboard />
    </div>
  </div>
);

export default ImpactDashboardPage;
