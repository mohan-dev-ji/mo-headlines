import Link from "next/link";

interface LogoProps {
  className?: string;
  asLink?: boolean;
}

export function Logo({ className = "", asLink = true }: LogoProps) {
  const logoText = (
    <span className={`font-abhaya-libre font-medium text-5xl leading-none ${className}`}>
      The Headlines
    </span>
  );

  if (asLink) {
    return (
      <Link
        href="/"
      >
        {logoText}
      </Link>
    );
  }

  return logoText;
} 