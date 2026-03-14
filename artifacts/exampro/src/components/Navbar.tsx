import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "./BrandLogo";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [location] = useLocation();

  const isAuthPage = location === "/login" || location === "/register";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <BrandLogo className="text-xl" />

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-4 hidden sm:block">
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-sm font-medium bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                      <User className="w-4 h-4 text-primary" />
                      <span>{user.fullName}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                      <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
                    </Button>
                  </div>
                </>
              ) : (
                !isAuthPage && (
                  <>
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                      Sign In
                    </Link>
                    <Link href="/register">
                      <Button className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-full px-6">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
