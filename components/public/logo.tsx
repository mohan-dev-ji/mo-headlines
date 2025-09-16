import Link from "next/link";

interface LogoProps {
  className?: string;
  asLink?: boolean;
}

export function Logo({ className = "", asLink = true }: LogoProps) {
  const logoText = (
    <span className={`font-abhaya-libre font-medium text-4xl leading-none ${className}`}>
      The Headlines
    </span>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className="hover:opacity-80 transition-opacity"
      >
        {logoText}
      </Link>
    );
  }

  return logoText;
} 