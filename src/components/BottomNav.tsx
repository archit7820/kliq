
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, BarChart2, UserCircle, Compass, Users } from 'lucide-react';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/log-activity', icon: PlusSquare, label: 'Log' },
  { path: '/leaderboard', icon: BarChart2, label: 'Stats' },
  { path: '/communities', icon: Users, label: 'Communities' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur-sm border-t">
      {/* Mobile-first bottom navigation */}
      <div className="flex justify-around items-center h-16 px-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 min-w-0 flex-1 touch-manipulation"
            >
              <item.icon 
                className={`w-5 h-5 mb-1 transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className={`text-xs font-medium transition-colors truncate ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
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
