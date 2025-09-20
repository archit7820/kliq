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
      description: "Monitor your carbon footprint with every action",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Heart,
      title: "Share", 
      description: "Join thousands making real environmental change",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Trophy,
      title: "Earn",
      description: "Get rewards for your sustainable lifestyle",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        
        {/* App Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
            <Leaf className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Save the earth with a snap
          </h1>
          <p className="text-xl text-gray-600 font-medium mb-2">
            Track your carbon footprint
          </p>
          <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
            Turn everyday actions into measurable environmental impact
          </p>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-md space-y-4 mb-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Impact Stats */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-12 shadow-xl border border-white/50 w-full max-w-md">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Community Impact</h3>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-3xl font-black text-green-600">+12.4k</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Environmental Actions</p>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Real Impact Tracking</h4>
            <p className="text-xs text-gray-600">Monitor your carbon footprint with every action</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Community Driven</h4>
            <p className="text-xs text-gray-600">Join thousands making real environmental change</p>
          </div>
        </div>

      </div>

      {/* Bottom CTA Section */}
      <div className="px-6 pb-8 pt-4">
        <Button 
          onClick={() => navigate('/auth')}
          size="lg"
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <p className="text-center text-xs text-gray-500 mt-4">
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