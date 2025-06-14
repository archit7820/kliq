
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { LoaderCircle, Leaf, Utensils, Home, ShoppingBag, Music, Users, BarChart2, UserCircle, Briefcase, Footprints, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const interests = [
  { name: 'Food', icon: Utensils },
  { name: 'Home', icon: Home },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Travel', icon: Footprints },
  { name: 'Work', icon: Briefcase },
  { name: 'Community', icon: Users },
  { name: 'Energy', icon: Zap },
  { name: 'Nature', icon: Leaf },
];

const OnboardingPage = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (interestName: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestName)
        ? prev.filter(item => item !== interestName)
        : [...prev, interestName]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (selectedInterests.length === 0) {
      toast({
        title: "Select at least one interest",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from('profiles')
      .update({ lifestyle_tags: selectedInterests })
      .eq('id', user.id);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Preferences saved!",
        description: "Welcome to Kelp!",
      });
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Personalize Your Experience</h1>
        <p className="text-gray-600 mb-6">Select a few interests so we can tailor content for you.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {interests.map(interest => {
            const isSelected = selectedInterests.includes(interest.name);
            return (
              <button
                key={interest.name}
                onClick={() => toggleInterest(interest.name)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border rounded-lg transition-all",
                  isSelected ? "bg-green-100 border-green-500 text-green-700 ring-2 ring-green-500" : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <interest.icon className="w-8 h-8 mb-2" />
                <span className="font-medium text-sm">{interest.name}</span>
              </button>
            );
          })}
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700">
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPage;
