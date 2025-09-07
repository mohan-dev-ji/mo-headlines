import Link from "next/link";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={`font-abhaya-libre font-medium text-[40px] leading-none hover:opacity-80 transition-opacity ${className}`}
    >
      The Headlines
    </Link>
  );
} 