
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
    <div className="min-h-screen bg-background">
      {/* Mobile-first main content area */}
      <main className={hideNav ? "pb-4" : "pb-20 sm:pb-24"}>
        {children}
      </main>
      
      {/* Bottom navigation - mobile optimized */}
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default MainLayout;
