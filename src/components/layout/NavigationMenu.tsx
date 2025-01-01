import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Coins, Search, Rocket, Compass, Twitter, Star, Video } from "lucide-react";

interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  isExternal?: boolean;
}

export const NavigationMenu = ({ onClose }: { onClose?: () => void }) => {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { title: "New Coins", icon: Coins, path: "/" },
    { title: "Featured", icon: Star, path: "/featured" },
    { title: "Explore", icon: Compass, path: "/explore" },
    { title: "Search", icon: Search, path: "/search" },
    { title: "Launch", icon: Rocket, path: "/launch" },
    { title: "Live Stream", icon: Video, path: "/live-stream" },
    { 
      title: "Community Updates", 
      icon: Twitter, 
      path: "https://x.com/Smarttdotfun",
      isExternal: true 
    },
  ];

  const handleNavigation = (path: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(path, '_blank');
    } else {
      navigate(path);
      onClose?.();
    }
  };

  return (
    <>
      {menuItems.map((item) => (
        <Button
          key={item.title}
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation(item.path, item.isExternal)}
          className="flex items-center gap-2 font-bold tracking-wide text-sm transition-all duration-300 hover:text-primary"
        >
          <item.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{item.title}</span>
        </Button>
      ))}
    </>
  );
};