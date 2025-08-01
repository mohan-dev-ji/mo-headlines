"use client";

import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/shared/navigation/AdminSidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isAdmin(user?.id)) {
      router.push("/");
    }
  }, [isLoaded, user?.id, router]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-headline-primary">Loading...</div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin(user?.id)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-background text-headline-primary">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--brand-card)',
            border: '1px solid var(--brand-line)',
            color: 'var(--headline-primary)',
          },
        }}
      />
    </div>
  );
}