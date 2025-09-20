import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Heart, 
  Trophy, 
  Leaf, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Globe,
      title: "Track",
      description: "Monitor your positive impact with every action",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Heart,
      title: "Share", 
      description: "Join thousands making real positive change",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Trophy,
      title: "Earn",
      description: "Get rewards for your meaningful activities",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col relative overflow-hidden">
      {/* iOS-style glassy background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 backdrop-blur-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        
        {/* App Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-green-500/90 to-emerald-600/90 rounded-[2.5rem] flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/20 ring-1 ring-white/10">
            <Leaf className="w-16 h-16 text-white drop-shadow-lg" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-400/90 to-orange-500/90 rounded-full flex items-center justify-center animate-bounce backdrop-blur-xl border border-white/30 shadow-lg">
            <Sparkles className="w-5 h-5 text-white drop-shadow-sm" />
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Save the earth with a snap
          </h1>
          <p className="text-xl text-gray-600 font-medium mb-2">
            Turn your IRL activities in social currency
          </p>
          <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
            An AI powered first of its kind social media build from India for the globe!
          </p>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-md space-y-4 mb-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 ring-1 ring-white/10"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.gradient}/90 shadow-lg backdrop-blur-sm border border-white/20`}>
                  <feature.icon className="w-7 h-7 text-white drop-shadow-sm" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">{feature.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Impact Stats */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 mb-12 shadow-2xl border border-white/30 w-full max-w-md ring-1 ring-white/10">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-6 h-6 text-green-600 drop-shadow-sm" />
              <span className="text-4xl font-black text-green-600 drop-shadow-lg">+12.4k</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 drop-shadow-sm">Community Impact</h3>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-12">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/30 text-center ring-1 ring-white/10 hover:bg-white/30 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400/90 to-emerald-500/90 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 shadow-lg">
              <Globe className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1 drop-shadow-sm">Real Impact Tracking</h4>
            <p className="text-xs text-gray-700">Monitor your positive impact with every action</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/30 text-center ring-1 ring-white/10 hover:bg-white/30 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400/90 to-pink-500/90 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 shadow-lg">
              <Users className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1 drop-shadow-sm">Community Driven</h4>
            <p className="text-xs text-gray-700">Join thousands making real positive change</p>
          </div>
        </div>

      </div>

      {/* Bottom CTA Section */}
      <div className="px-6 pb-8 pt-4 relative z-10">
        <Button 
          onClick={() => navigate('/auth')}
          size="lg"
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500/90 to-emerald-600/90 hover:from-green-600/90 hover:to-emerald-700/90 text-white font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-200 backdrop-blur-xl border border-white/20 ring-1 ring-white/10"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <p className="text-center text-xs text-gray-600 mt-4 drop-shadow-sm">
          Join thousands making real impact on our planet 🌱
        </p>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-32 left-8 animate-bounce opacity-20" style={{animationDelay: '0s'}}>
        <Heart className="w-8 h-8 text-pink-500" />
      </div>
      <div className="absolute top-40 right-12 animate-bounce opacity-25" style={{animationDelay: '1s'}}>
        <Globe className="w-6 h-6 text-blue-500" />
      </div>
      <div className="absolute bottom-40 left-12 animate-bounce opacity-20" style={{animationDelay: '2s'}}>
        <Trophy className="w-7 h-7 text-yellow-500" />
      </div>
      
    </main>
  );
};

export default LandingPage;