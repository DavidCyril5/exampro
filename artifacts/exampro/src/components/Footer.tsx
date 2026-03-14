export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          &copy; {year}{" "}
          <span className="font-semibold text-foreground">EXAMPRO</span>
          <span className="text-primary font-black italic mx-0.5">X</span>
          <span className="font-semibold text-foreground">EXAMCORE</span>
          . All rights reserved.
        </span>
        <span className="hidden sm:block">The Next Generation Examination Platform</span>
      </div>
    </footer>
  );
}
