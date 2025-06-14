
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, Users, MapPin, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FeedFiltersProps {
  selectedCategory: string | null;
  selectedLocation: string | null;
  showFriendsOnly: boolean;
  onCategoryChange: (category: string | null) => void;
  onLocationChange: (location: string | null) => void;
  onFriendsOnlyChange: (friendsOnly: boolean) => void;
}

const categories = [
  'Transportation',
  'Food',
  'Energy',
  'Shopping',
  'Travel',
  'Waste',
  'Other'
];

const locations = [
  'New York',
  'Los Angeles',
  'San Francisco',
  'Chicago',
  'Boston',
  'Seattle',
  'Austin'
];

const FeedFilters: React.FC<FeedFiltersProps> = ({
  selectedCategory,
  selectedLocation,
  showFriendsOnly,
  onCategoryChange,
  onLocationChange,
  onFriendsOnlyChange,
}) => {
  const hasActiveFilters = selectedCategory || selectedLocation || showFriendsOnly;

  const clearAllFilters = () => {
    onCategoryChange(null);
    onLocationChange(null);
    onFriendsOnlyChange(false);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Friends Only Toggle */}
          <Button
            variant={showFriendsOnly ? "default" : "outline"}
            size="sm"
            onClick={() => onFriendsOnlyChange(!showFriendsOnly)}
            className="h-8"
          >
            <Users className="w-4 h-4 mr-1" />
            Friends Only
          </Button>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Category
                {selectedCategory && (
                  <Badge variant="secondary" className="ml-2 h-5">
                    {selectedCategory}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onCategoryChange(null)}>
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Location Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <MapPin className="w-4 h-4 mr-1" />
                Location
                {selectedLocation && (
                  <Badge variant="secondary" className="ml-2 h-5">
                    {selectedLocation}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onLocationChange(null)}>
                All Locations
              </DropdownMenuItem>
              {locations.map((location) => (
                <DropdownMenuItem
                  key={location}
                  onClick={() => onLocationChange(location)}
                >
                  {location}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-muted-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedFilters;
