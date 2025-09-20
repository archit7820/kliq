import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, Camera } from 'lucide-react';

interface JoinWithActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'community' | 'challenge';
  itemId: string;
  itemName: string;
  onDirectJoin: () => void;
}

const JoinWithActivityModal = ({ 
  isOpen, 
  onClose, 
  type, 
  itemId, 
  itemName, 
  onDirectJoin 
}: JoinWithActivityModalProps) => {
  const navigate = useNavigate();

  const handleJoinWithActivity = () => {
    const params = new URLSearchParams({
      [`${type}_id`]: itemId,
      auto_join: 'true'
    });
    navigate(`/log-activity?${params.toString()}`);
    onClose();
  };

  const handleDirectJoin = () => {
    onDirectJoin();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Join {itemName}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            How would you like to join this {type}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Join with Activity Option */}
          <Button
            onClick={handleJoinWithActivity}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-left justify-start px-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">Log Activity & Join</div>
                <div className="text-sm opacity-90">Share your eco-action and join together</div>
              </div>
            </div>
          </Button>

          {/* Direct Join Option */}
          <Button
            onClick={handleDirectJoin}
            variant="outline"
            className="w-full h-16 rounded-2xl border-2 border-gray-200 hover:border-gray-300 font-bold text-left justify-start px-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-gray-700">
                <div className="font-bold">Just Join</div>
                <div className="text-sm opacity-70">Join without posting activity</div>
              </div>
            </div>
          </Button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-gray-500">
            {type === 'community' ? 'Join the community' : 'Complete the challenge'} your way!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinWithActivityModal;