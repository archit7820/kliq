import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Check, Share, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActivityChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'challenge' | 'community' | 'activity';
  actionTitle: string;
  actionData: {
    challengeId?: string;
    communityId?: string;
    description?: string;
    category?: string;
    prefilledActivity?: string;
    prefilledCaption?: string;
  };
  onJustComplete: () => Promise<void>;
}

const ActivityChoiceModal: React.FC<ActivityChoiceModalProps> = ({
  isOpen,
  onClose,
  actionType,
  actionTitle,
  actionData,
  onJustComplete
}) => {
  const navigate = useNavigate();

  const getActionIcon = () => {
    switch (actionType) {
      case 'challenge':
        return <Check className="w-8 h-8 text-green-600" />;
      case 'community':
        return <Users className="w-8 h-8 text-blue-600" />;
      default:
        return <Share className="w-8 h-8 text-purple-600" />;
    }
  };

  const getActionText = () => {
    switch (actionType) {
      case 'challenge':
        return 'You completed a challenge!';
      case 'community':
        return 'You joined a community!';
      default:
        return 'You completed an activity!';
    }
  };

  const handleJustComplete = async () => {
    try {
      await onJustComplete();
      onClose();
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };

  const handleLogActivity = () => {
    // Store the action data in localStorage for the log activity page
    const logData = {
      actionType,
      actionTitle,
      ...actionData,
      prefilledActivity: actionData.prefilledActivity || `${actionType === 'challenge' ? 'Completed challenge' : actionType === 'community' ? 'Joined community' : 'Completed activity'}: ${actionTitle}`,
      prefilledCaption: actionData.prefilledCaption || `Just ${actionType === 'challenge' ? 'completed' : 'joined'} "${actionTitle}"! 🎉`,
      category: actionData.category || actionType
    };
    
    localStorage.setItem('pendingActivityLog', JSON.stringify(logData));
    onClose();
    navigate('/log-activity');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/30 ring-1 ring-white/10 rounded-3xl p-6 max-w-sm mx-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              {getActionIcon()}
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {getActionText()}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Would you like to share this with the community?
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {/* Log & Share Option */}
          <Button
            onClick={handleLogActivity}
            className="w-full h-14 bg-gradient-to-r from-green-500/90 to-blue-500/90 hover:from-green-600/90 hover:to-blue-600/90 text-white font-semibold rounded-2xl backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center gap-3"
          >
            <Camera className="w-5 h-5" />
            Log Activity & Share
          </Button>

          {/* Just Complete Option */}
          <Button
            onClick={handleJustComplete}
            variant="outline"
            className="w-full h-12 bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 text-gray-700 font-medium rounded-2xl flex items-center justify-center gap-3"
          >
            <Check className="w-4 h-4" />
            Just Complete Quietly
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can always share your activities later from your profile
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityChoiceModal;