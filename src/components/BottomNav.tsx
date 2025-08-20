
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, BarChart2, UserCircle, Compass, Users } from 'lucide-react';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Feeds' },
  { path: '/log-activity', icon: PlusSquare, label: 'Log' },
  { path: '/leaderboard', icon: BarChart2, label: 'Stats' },
  { path: '/communities', icon: Users, label: 'Communities' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-background/98 backdrop-blur-md border-t border-border/80 shadow-lg">
      {/* Mobile-optimized bottom navigation */}
      <div className="flex justify-around items-center h-14 px-1 safe-area-pb max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-200 min-w-0 flex-1 touch-manipulation active:scale-95 ${
                isActive ? 'bg-primary/10' : 'hover:bg-muted/60'
              }`}
            >
              <item.icon 
                className={`w-4 h-4 mb-0.5 transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className={`text-[10px] font-medium transition-colors truncate leading-tight ${
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
