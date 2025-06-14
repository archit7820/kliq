
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Users, BarChart2, UserCircle } from 'lucide-react'; // Using Users for Feed, BarChart2 for Leaderboard

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/log-activity', icon: PlusSquare, label: 'Log' },
  { path: '/feed', icon: Users, label: 'Feed' },
  { path: '/leaderboard', icon: BarChart2, label: 'Stats' },
  { path: '/friends', icon: UserCircle, label: 'Friends' }, // Add Friends to nav (used UserCircle)
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow- ऊपर-md">
      <div className="max-w-screen-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ease-in-out
                ${isActive ? 'text-green-600 scale-110' : 'text-gray-500 hover:text-green-500'}
              `}
            >
              <item.icon className={`w-6 h-6 mb-0.5 ${isActive ? 'fill-current text-green-500' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
