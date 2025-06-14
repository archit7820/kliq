
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Sparkles } from "lucide-react";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gradient-to-b from-green-200 via-green-50 to-blue-100">
      {/* Top banner with logo/illustration */}
      <div className="w-full flex flex-col items-center mt-12 mb-6 px-4">
        <Leaf className="h-16 w-16 text-green-600 mb-3 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
        <h1 className="font-bold text-3xl md:text-4xl text-green-900 drop-shadow mb-2 text-center">Welcome to Kelp</h1>
        <p className="text-lg md:text-xl text-green-800 text-center max-w-xs mb-4">
          Your personal journey to a lighter climate impact starts here.
        </p>
        <Sparkles className="h-7 w-7 text-green-400 mb-4" />
        <p className="text-gray-600 text-base md:text-lg text-center max-w-sm">
          Log everyday green actions, join fun challenges, and see your impact grow—together with friends and the planet. 🌍
        </p>
      </div>
      {/* CTA Buttons */}
      <div className="w-full flex flex-col gap-3 px-6 mb-10">
        <Button
          className="w-full bg-green-700 text-white text-lg py-3 rounded-full shadow-xl shadow-green-300/30 hover:bg-green-800 transition"
          onClick={() => navigate("/signup")}
        >
          Get Started
        </Button>
        <Button
          variant="outline"
          className="w-full text-green-700 border-green-600 text-lg py-3 rounded-full"
          onClick={() => navigate("/login")}
        >
          Log in
        </Button>
      </div>
      {/* Simple footer */}
      <footer className="w-full text-xs text-center text-gray-400 mb-3">
        By continuing you agree to our{" "}
        <span className="underline cursor-pointer hover:text-green-700">Terms</span> &amp;{" "}
        <span className="underline cursor-pointer hover:text-green-700">Privacy</span>
      </footer>
    </div>
  );
};

export default WelcomePage;
