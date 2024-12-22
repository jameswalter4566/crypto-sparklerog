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
import { Coins, Trophy, Search, Rocket, Building } from "lucide-react";
import { Link } from "react-router-dom";

const menuItems = [
  {
    title: "New Coins",
    icon: Coins,
    path: "/",
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
                  <SidebarMenuButton asChild>
                    {item.external ? (
                      <a 
                        href={item.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-menu font-bold tracking-wide uppercase text-sm transition-all duration-300 hover:text-primary hover:animate-glow-pulse"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    ) : (
                      <Link 
                        to={item.path} 
                        className="flex items-center gap-2 font-menu font-bold tracking-wide uppercase text-sm transition-all duration-300 hover:text-primary hover:animate-glow-pulse"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    )}
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