
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
    <Card className="overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
      <img src={imageUrl} alt={brandName} className="w-full h-40 object-cover" />
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle>{brandName}</CardTitle>
            <Badge variant="secondary">
              <Leaf className="mr-1.5 h-3 w-3 text-green-600" />
              {offsetValue}kg CO₂
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
          <a href={purchaseLink} target="_blank" rel="noopener noreferrer">
            Shop Now <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BrandCard;
