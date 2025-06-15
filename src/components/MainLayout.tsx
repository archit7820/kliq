
import React from "react";
import BottomNav from "./BottomNav";
import { useLocation } from "react-router-dom";

const noNavRoutes = ["/login", "/signup", "/onboarding", "/welcome", "/invite"];

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();

  // Hide BottomNav on auth and onboarding pages
  const hideNav = noNavRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default MainLayout;
