import { UserSync } from "./UserSync";

interface RootLayoutContentProps {
  children: React.ReactNode;
}

export function RootLayoutContent({ children }: RootLayoutContentProps) {
  return (
    <>
      <UserSync />
      {children}
    </>
  );
}