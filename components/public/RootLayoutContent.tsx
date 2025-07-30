"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

interface RootLayoutContentProps {
  children: React.ReactNode;
}

export function RootLayoutContent({ children }: RootLayoutContentProps) {
  const pathname = usePathname();
  
  // Don't show Header on admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
    </>
  );
}