"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Logo } from "@/components/public/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Rss,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "RSS Sources",
    href: "/admin/rss-sources",
    icon: Rss,
  },
  {
    name: "Articles",
    href: "/admin/articles",
    icon: FileText,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="flex flex-col w-64 bg-brand-background">
      {/* Logo section */}
      <div className="flex items-center px-[var(--padding-lg)] py-[var(--padding-lg)]">
        <Logo className="h-8" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-[var(--padding-lg)] py-4 space-y-1">
        <div className="border-t border-brand-line mb-4"></div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-brand-card text-headline-primary"
                  : "text-body-greyed-out hover:bg-brand-card hover:text-headline-primary"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User profile section */}
      <div className="px-[var(--padding-lg)] py-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} alt={user?.firstName || "User"} />
            <AvatarFallback className="bg-brand-background text-headline-primary text-sm">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm text-headline-primary font-medium truncate">
              {user?.firstName || "Admin"}
            </p>
            <p className="text-caption text-body-secondary truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>

        <SignOutButton>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-body-secondary hover:text-headline-primary hover:bg-brand-card-dark"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}