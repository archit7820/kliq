
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Leaf } from 'lucide-react';

interface BrandCardProps {
  brandName: string;
  description: string;
  imageUrl: string;
  offsetValue: number;
  purchaseLink: string;
}

const BrandCard: React.FC<BrandCardProps> = ({ brandName, description, imageUrl, offsetValue, purchaseLink }) => {
  return (
    <Card className="overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-all duration-300 h-full group">
      <div className="relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={brandName} 
          className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 text-green-700 shadow-sm">
            <Leaf className="mr-1 h-3 w-3 text-green-600" />
            {offsetValue}kg CO₂
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-base line-clamp-1">{brandName}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow pb-2">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          asChild 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2 border-emerald-500 hover:border-emerald-600 text-xs sm:text-sm h-8 sm:h-9"
        >
          <a href={purchaseLink} target="_blank" rel="noopener noreferrer" aria-label={`Shop ${brandName} products`}>
            Shop Now <ArrowRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BrandCard;
