import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Coins, Trophy, Search, Rocket, Star, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

type MenuItem = {
  title: string;
  icon: LucideIcon;
  path: string;
  external?: boolean;
};

const menuItems: MenuItem[] = [
  {
    title: "NODE",
    icon: Navigation,
    path: "https://nodecompany.fun",
    external: true,
  },
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
];

export function AppSidebar() {
  const navigate = useNavigate();

  const handleNavigation = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank');
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
                    className="flex items-center gap-2 font-menu font-bold tracking-wide uppercase text-sm transition-all duration-300 bg-primary bg-opacity-5 shadow-[0_0_15px_rgba(75,156,211,0.3)] hover:shadow-[0_0_25px_rgba(75,156,211,0.5)] hover:text-white rounded-md px-4 py-2 cursor-pointer text-primary"
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