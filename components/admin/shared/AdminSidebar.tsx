"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { LogoSm } from "@/components/public/LogoSm";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Plus,
  FileCheck,
  Image,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Create",
    href: "/admin/create",
    icon: Plus,
  },
  {
    name: "Review",
    href: "/admin/review",
    icon: FileCheck,
  },
  {
    name: "Images",
    href: "/admin/images",
    icon: Image,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo section */}
      <div className="flex items-center justify-between px-[var(--padding-lg)] pt-[var(--padding-lg)] md:justify-start">
        <Link href="/" className="transition-opacity">
          <LogoSm asLink={false} />
        </Link>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden text-headline-primary hover:text-brand-primary transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
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
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center px-3 py-3 text-sm rounded-lg transition-colors",
                isActive
                  ? "bg-brand-card-dark text-headline-primary"
                  : "text-body-greyed-out hover:bg-brand-card-dark"
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
    </>
  );

  return (
    <>
      {/* Mobile burger menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-brand-card-dark text-headline-primary p-2 rounded-lg shadow-lg hover:bg-brand-card transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-brand-background">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-full bg-brand-background transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}