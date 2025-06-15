
import React from "react";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard } from "lucide-react";

interface Props {
  onSkip: () => void;
}

const SubscriptionPaywall: React.FC<Props> = ({ onSkip }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-100 to-green-100 p-4">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
      <Lock className="w-16 h-16 text-violet-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscribe to Unlock Kelp</h2>
      <p className="text-gray-600 mb-6 text-center">Access to this app requires a monthly subscription of <span className="font-semibold">£3.99 GBP</span> (UK) or <span className="font-semibold">$3.99 USD</span> (elsewhere).</p>
      <Button className="w-full mb-2 flex items-center justify-center gap-2" variant="default" disabled>
        <CreditCard className="w-5 h-5" /> Pay with Stripe (coming soon)
      </Button>
      <Button variant="outline" className="w-full" onClick={onSkip}>
        Skip & Access the App
      </Button>
      <span className="text-xs text-gray-400 mt-4">You can access the app for now. Stripe paywall integration coming soon.</span>
    </div>
  </div>
);

export default SubscriptionPaywall;
