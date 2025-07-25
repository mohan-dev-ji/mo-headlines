"use client";

import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { isSignedIn } = useUser();

  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('Admin page loaded');
    console.log('Is loaded:', isLoaded);
    console.log('User ID:', user?.id);
    console.log('Is Admin:', isAdmin(user?.id));
    
    if (isLoaded && !isAdmin(user?.id)) {
      console.log('Not admin, redirecting to home');
      router.push("/");
    }
  }, [isLoaded, user?.id, router]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAdmin(user?.id)) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Tools</h1>
      
      <div className="space-y-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Database Management</h2>
          <p className="text-gray-600 mb-4">
            This is the admin dashboard. You can manage your database and site settings here.
          </p>
        </div>

        <div className="container py-2 space-y-2">
            {/* <NavLinks vertical /> */}
            {isSignedIn && (
              <Link href="/create">
                <Button variant="outline" className="w-full">
                  Create Post
                </Button>
              </Link>
            )}
          </div>

      </div>
    </div>
  );
} 