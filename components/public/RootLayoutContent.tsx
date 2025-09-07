interface RootLayoutContentProps {
  children: React.ReactNode;
}

export function RootLayoutContent({ children }: RootLayoutContentProps) {
  return (
    <>
      {children}
    </>
  );
}