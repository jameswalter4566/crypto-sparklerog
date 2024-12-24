import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Coins, Trophy, Search, Rocket, Building, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const menuItems = [
  {
    title: "Trending Coins",
    icon: Coins,
    path: "/",
  },
  {
    title: "New Coins",
    icon: Star,
    path: "/new-coins",
  },
  {
    title: "Coin Search",
    icon: Search,
    path: "/search",
  },
  {
    title: "Launch Coin",
    icon: Rocket,
    path: "/launch",
  },
  {
    title: "Meme Coin Leaderboard",
    icon: Trophy,
    path: "/leaderboard",
  },
  {
    title: "Agent Company Collection",
    icon: Building,
    path: "https://agentcompany.xyz/",
    external: true,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();

  const handleNavigation = (path: string, external: boolean = false) => {
    if (external) {
      window.open(path, "_blank");
    } else {
      navigate(path);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="h-20"></div>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.path, item.external)}
                    className="flex items-center gap-2 font-menu font-bold tracking-wide uppercase text-sm transition-all duration-300 hover:text-primary hover:animate-glow-pulse cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}