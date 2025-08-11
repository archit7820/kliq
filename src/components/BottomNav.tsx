
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, BarChart2, UserCircle, Compass, Users } from 'lucide-react';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/feed', icon: Compass, label: 'Explore' },
  { path: '/log-activity', icon: PlusSquare, label: 'Log' },
  { path: '/leaderboard', icon: BarChart2, label: 'Stats' },
  { path: '/communities', icon: Users, label: 'Communities' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50">
      {/* Removed md:hidden to show BottomNav on all devices */}
      <div className="max-w-screen-md mx-auto flex justify-around items-center h-16 px-3 rounded-full border bg-card/80 backdrop-blur-xl shadow-lg">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center p-2 rounded-full transition-colors duration-200 ease-in-out w-16 hover:bg-muted/60"
            >
              <item.icon className={`w-6 h-6 mb-1 transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
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
