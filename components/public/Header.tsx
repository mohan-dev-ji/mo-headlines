"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Logo } from "./logo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


export default function Header() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const categories = useQuery(api.categories.getActiveCategories);
  const topics = useQuery(api.topics.getAllTopics);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="border-b bg-brand-card">
      <div className="mx-auto px-16 max-w-7xl">
        <nav className="flex justify-between items-center h-16">
          {/* Logo as home button */}
          <Link href="/">
            <Logo />
          </Link>

          {/* Right-aligned navigation - Categories and Auth */}
          <div className="hidden md:flex items-center gap-8">
            {/* Categories */}
            {categories && categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="text-body-primary hover:text-brand-primary transition-colors duration-200"
              >
                {category.name}
              </Link>
            ))}
            
            {/* Auth section */}
            <AuthSection />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b">
              <div className="container px-4 py-2 space-y-2">
                {categories && categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug}`}
                    className="block py-2 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                {topics && topics.map((topic) => (
                  <Link
                    key={topic._id}
                    href={`/topic/${topic.slug}`}
                    className="block py-2 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {topic.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function AuthSection() {
  const { isSignedIn } = useUser();

  return (
    <>
      {isSignedIn ? (
        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                userButtonPopoverCard: "w-96",
              },
            }}
            afterSignOutUrl="/"
            userProfileUrl="/profile"
          />
        </div>
      ) : (
        <Link href="/sign-in">
          <Button variant="ghost">Sign In</Button>
        </Link>
      )}
    </>
  );
}
