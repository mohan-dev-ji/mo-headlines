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
  { key: "tech", label: "Tech" },
  { key: "science", label: "Science" },
  { key: "finance", label: "Finance" },
  { key: "policies", label: "Policies" },
];

export function BadgeFilterBar() {
  const { activeFilter, setFilter } = useArticleFilter();
  const { isSignedIn } = useUser();

  return (
    <div className="w-full lg:pt-page-y pt-8">
      <div className="max-w-page mx-auto px-4 sm:px-6">
        {/* Desktop Layout - Logo, Badges, and Auth in one row */}
        <div className="hidden md:flex items-center justify-between py-6">
          {/* Left section - Logo + Filter Badges */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo className="text-headline-primary" />
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

        {/* Mobile Layout - Logo and Auth on top, Badges below */}
        <div className="md:hidden">
          {/* Top row - Logo and Auth */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-shrink-0">
              <Logo className="text-headline-primary" />
            </div>
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

          {/* Bottom row - Filter Badges */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4">
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
      </div>
    </div>
  );
}