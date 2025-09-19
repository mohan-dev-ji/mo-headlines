import Link from "next/link";

interface LogoSmProps {
  className?: string;
  asLink?: boolean;
}

export function LogoSm({ className = "", asLink = true }: LogoSmProps) {
  const logoText = (
    <span className={`font-abhaya-libre font-medium text-3xl leading-none ${className}`}>
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