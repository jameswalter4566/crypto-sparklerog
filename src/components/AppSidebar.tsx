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
import { Coins, Trophy, Wallet, Search, Rocket } from "lucide-react";
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
    title: "Holdings",
    icon: Wallet,
    path: "/holdings",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="h-48"></div> {/* Added spacing for logo */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
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