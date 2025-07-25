"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Logo } from "./logo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


export default function Header() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const categories = useQuery(api.categories.getAllCategories);
  const topics = useQuery(api.topics.getAllTopics);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="border-b">
      <div className="mx-auto px-16 max-w-7xl">
        <nav className="flex justify-between items-center h-16">
          {/* Logo as home button */}
          <Link href="/">
            <Logo />
          </Link>

          {/* Right-aligned navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Categories dropdown */}
            <div className="relative group">
              <Button
                variant="ghost"
                className="flex items-center gap-1"
              >
                Categories
              </Button>
              {categories && (
                <div className="absolute top-full right-0 w-48 bg-white border rounded-md shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto translate-x-[-0px] z-50">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/category/${category.slug}`}
                      className="block px-4 py-2 hover:bg-gray-100 text-right"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Topics dropdown */}
            <div className="relative group">
              <Button
                variant="ghost"
                className="flex items-center gap-1"
              >
                Topics
              </Button>
              {topics && (
                <div className="absolute top-full right-0 w-48 bg-white border rounded-md shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto translate-x-[-0px] z-50">
                  {topics.map((topic) => (
                    <Link
                      key={topic._id}
                      href={`/topic/${topic.slug}`}
                      className="block px-4 py-2 hover:bg-gray-100 text-right"
                    >
                      {topic.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
