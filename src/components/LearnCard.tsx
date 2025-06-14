
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface LearnCardProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const LearnCard: React.FC<LearnCardProps> = ({ title, description, imageUrl, link }) => {
  return (
    <Card className="overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
      <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href={link} target="_blank" rel="noopener noreferrer">
            Learn More <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LearnCard;
