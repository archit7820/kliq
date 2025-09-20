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

  const handleClose = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const forceClose = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose} modal={true}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] sm:h-[85vh] max-h-[800px] rounded-t-3xl bg-background shadow-2xl border-t-4 border-primary max-w-full sm:max-w-lg sm:mx-auto p-3 sm:p-4 z-[100] overflow-hidden flex flex-col"
        onPointerDownOutside={(e) => {
          e.preventDefault();
          forceClose();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          forceClose();
        }}
      >
        {/* Custom close button as fallback */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 rounded-full hover:bg-muted/30 touch-manipulation active:scale-95 z-[999] bg-background/80 backdrop-blur-sm border border-border/50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            forceClose();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            forceClose();
          }}
          type="button"
        >
          <X className="w-4 h-4" />
        </Button>
        <SheetHeader className="text-left pb-3 sm:pb-4 px-0 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 pr-10">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg sm:text-xl font-bold text-foreground line-clamp-1">
                Impact Breakdown
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {post.activity}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {Math.round((post.carbon_footprint_kg || 0) * 10)}
                </p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Impact Score</p>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {/* Dimensions */}
          <div className="space-y-4">
            {impactDimensions.map((dimension) => {
              const value = analysis?.[dimension.key] || 0;
              const Icon = dimension.icon;
              
              return (
                <div key={dimension.key} className="space-y-3 p-3 rounded-lg bg-card border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${dimension.bgColor} flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${dimension.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                          {dimension.label}
                        </h3>
                        <span className="text-sm font-bold text-primary flex-shrink-0">
                          {Math.round(value)}/100
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {dimension.description}
                      </p>
                      <Progress 
                        value={Math.max(0, Math.min(100, value))} 
                        className="h-2.5"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
              <Zap className="w-4 h-4 text-primary" />
              How Impact Score Works
            </h4>
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
