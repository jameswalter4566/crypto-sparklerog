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
    description: "Discover the latest crypto launches",
  },
  {
    title: "Coin Search",
    icon: Search,
    path: "/search",
    description: "Find and analyze tokens",
  },
  {
    title: "Launch Coin",
    icon: Rocket,
    path: "/launch",
    description: "Create your own token",
  },
  {
    title: "Meme Coin Leaderboard",
    icon: Trophy,
    path: "/leaderboard",
    description: "Top performing meme coins",
  },
  {
    title: "Agent Company Collection",
    icon: Building,
    path: "https://agentcompany.xyz/",
    external: true,
    description: "Explore our collection",
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
                        className="flex flex-col w-full p-4 gap-2 rounded-lg bg-card hover:bg-primary/10 transition-all duration-200 group border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-11">
                          {item.description}
                        </p>
                      </a>
                    ) : (
                      <Link 
                        to={item.path} 
                        className="flex flex-col w-full p-4 gap-2 rounded-lg bg-card hover:bg-primary/10 transition-all duration-200 group border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-11">
                          {item.description}
                        </p>
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