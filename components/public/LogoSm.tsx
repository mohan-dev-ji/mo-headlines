import Link from "next/link";

interface LogoSmProps {
  className?: string;
}

export function LogoSm({ className = "" }: LogoSmProps) {
  return (
    <Link 
      href="/" 
      className={`font-abhaya-libre font-medium text-[24px] leading-none hover:opacity-80 transition-opacity ${className}`}
    >
      The Headlines
    </Link>
  );
}