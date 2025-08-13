
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
        <Button asChild variant="outline" className="w-full border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-blue-400">
          <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Learn more about ${title}`}>
            Learn More <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LearnCard;
