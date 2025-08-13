import React from "react";
import { Leaf, Users, Zap, DollarSign, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ImpactScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    activity: string;
    carbon_footprint_kg: number;
    activity_analysis?: {
      environmental_impact?: number;
      social_connection?: number;
      adventure_intensity?: number;
      economic_impact?: number;
      learning_growth?: number;
    } | null;
  };
}

const impactDimensions = [
  {
    key: "environmental_impact",
    label: "Environmental Impact",
    description: "CO2e reduction, waste prevention, resource conservation",
    icon: Leaf,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    key: "social_connection",
    label: "Social Connection",
    description: "Community building, collaboration, inspiring others",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "adventure_intensity",
    label: "Adventure Intensity",
    description: "Effort, challenge level, stepping out of comfort zone",
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "economic_impact",
    label: "Economic Impact",
    description: "Cost savings, supporting local economy, financial benefit",
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    key: "learning_growth",
    label: "Learning & Growth",
    description: "New skills, knowledge sharing, personal development",
    icon: BookOpen,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
] as const;

const ImpactScoreModal = ({ isOpen, onClose, post }: ImpactScoreModalProps) => {
  const analysis = post.activity_analysis;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">Impact Breakdown</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                {post.activity}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {Math.round((post.carbon_footprint_kg || 0) * 10)}
                </p>
                <p className="text-xs text-muted-foreground">Impact Score</p>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Dimensions */}
          <div className="space-y-4">
            {impactDimensions.map((dimension) => {
              const value = analysis?.[dimension.key] || 0;
              const Icon = dimension.icon;
              
              return (
                <div key={dimension.key} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${dimension.bgColor}`}>
                      <Icon className={`w-4 h-4 ${dimension.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{dimension.label}</h3>
                        <span className="text-sm font-semibold">
                          {Math.round(value)}/100
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dimension.description}
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, value))} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h4 className="font-medium text-sm mb-2">How Impact Score Works</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your Impact Score measures the positive effect of your real-world activities 
              across five key dimensions. Each activity is analyzed for its environmental 
              benefit, social influence, personal challenge, economic impact, and learning 
              value. Higher scores unlock badges, increase your Ripple Score, and inspire 
              others in the community.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ImpactScoreModal;