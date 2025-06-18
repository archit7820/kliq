
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { LoaderCircle, Leaf, Utensils, Home, ShoppingBag, Users, Briefcase, Footprints, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (interestName: string) => {
    if (isSubmitting) return; // Prevent changes while submitting
    
    setSelectedInterests(prev =>
      prev.includes(interestName)
        ? prev.filter(item => item !== interestName)
        : [...prev, interestName]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "User not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedInterests.length === 0) {
      toast({
        title: "Select at least one interest",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    
    try {
      console.log('Submitting interests:', selectedInterests, 'for user:', user.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({ lifestyle_tags: selectedInterests })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error saving preferences",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Profile updated successfully');
      
      // Invalidate and refetch the profile query
      await queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      
      toast({
        title: "Preferences saved!",
        description: "Welcome to Kelp!",
      });
      
      // Small delay to ensure the query cache is updated
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 500);
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error saving preferences",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
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
                disabled={isSubmitting}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border rounded-lg transition-all disabled:opacity-50",
                  isSelected ? "bg-green-100 border-green-500 text-green-700 ring-2 ring-green-500" : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <interest.icon className="w-8 h-8 mb-2" />
                <span className="font-medium text-sm">{interest.name}</span>
              </button>
            );
          })}
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || selectedInterests.length === 0} 
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPage;
