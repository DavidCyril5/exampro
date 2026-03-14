import { Link } from "wouter";

interface BrandLogoProps {
  className?: string;
  withLink?: boolean;
}

export function BrandLogo({ className = "", withLink = true }: BrandLogoProps) {
  const content = (
    <div className={`flex items-center tracking-tight ${className}`}>
      <span className="font-display font-bold text-foreground">
        EXAMPRO
      </span>
      <span className="text-primary text-xl mx-1.5 font-black italic shadow-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
        X
      </span>
      <span className="font-display font-bold text-foreground">
        EXAMCORE
      </span>
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
