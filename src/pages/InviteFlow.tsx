
import React from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Sparkles, LoaderCircle } from "lucide-react";
import InviteCodeValidator from "@/components/invite/InviteCodeValidator";
import InviteCodeSharer from "@/components/invite/InviteCodeSharer";

const InviteFlow = () => {
  const { user, loading } = useAuthStatus();

  // Loading UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-100 to-blue-50">
        <LoaderCircle className="w-8 h-8 animate-spin text-green-500 mr-3" />
        <span className="text-xl text-green-700">Loading…</span>
      </div>
    );
  }

  // Authenticated: Show invite code and share options
  if (user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-green-100 to-blue-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <Sparkles className="w-12 h-12 text-green-600 mb-5 animate-pulse" />
          <h1 className="text-2xl font-bold text-green-800 mb-2 text-center">Share Your Kelp Invite Code</h1>
          <p className="text-gray-600 text-center mb-4">
            Give your invite code to friends! When they join, you both earn 50 Kelp Points.
          </p>
          <InviteCodeSharer />
          <div className="mt-3 text-xs text-green-700 text-center">
            Every successful invite earns both of you 50 Kelp Points!
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-400 max-w-xs leading-relaxed">
          Want more connections? Invite more friends!
        </div>
      </div>
    );
  }

  // Unauthenticated: show original join form
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-green-100 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <Sparkles className="w-12 h-12 text-green-600 mb-5 animate-pulse" />
        <h1 className="text-2xl font-bold text-green-800 mb-2 text-center">Kelp Invite</h1>
        <p className="text-gray-600 text-center mb-6">
          Enter your invite code to access climate-positive actions, rewards, and community!
        </p>
        <InviteCodeValidator onSuccess={() => {}} />
      </div>
      <div className="mt-8 text-center text-sm text-gray-400 max-w-xs leading-relaxed">
        Want access? Watch for community drops or ask a friend for an invite!
      </div>
    </div>
  );
};

export default InviteFlow;
