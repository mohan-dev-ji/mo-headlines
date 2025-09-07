"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "../../ui/button";
import { Logo } from "../logo";
import { LogoSm } from "../LogoSm";
import { Badge } from "../../ui/badge";
import { useArticleFilter, type FilterCategory } from "./useArticleFilter";

const FILTER_OPTIONS: Array<{ key: FilterCategory; label: string }> = [
  { key: "recent", label: "Recent" },
  { key: "tech-science", label: "Tech & Science" },
  { key: "finance", label: "Finance" },
  { key: "policies", label: "Policies" },
];

export function BadgeFilterBar() {
  const { activeFilter, setFilter } = useArticleFilter();
  const { isSignedIn } = useUser();

  return (
    <div className="w-full pt-page-y">
      <div className="max-w-page mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-6">
          {/* Left section - Logo + Filter Badges (no gap) */}
          <div className="flex items-center gap-6">
            {/* Logo - responsive sizing */}
            <div className="flex-shrink-0">
              <div className="hidden md:block">
                <Logo className="text-headline-primary" />
              </div>
              <div className="block md:hidden">
                <LogoSm className="text-headline-primary" />
              </div>
            </div>

            {/* Filter Badges */}
            <div className="flex items-center gap-3 overflow-x-auto">
              {FILTER_OPTIONS.map((option) => (
                <Badge
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`cursor-pointer transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeFilter === option.key
                      ? "bg-brand-badge-background text-brand-primary border-brand-badge-background"
                      : "bg-brand-card text-body-secondary border-brand-card hover:bg-brand-card-dark"
                  }`}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right section - Auth */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    userButtonPopoverCard: "w-96",
                  },
                }}
                afterSignOutUrl="/"
                userProfileUrl="/profile"
              />
            ) : (
              <Link href="/sign-in">
                <Button 
                  variant="ghost" 
                  className="text-body-primary hover:text-brand-primary hover:bg-brand-card-dark"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}