import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "./BrandLogo";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu, X, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthPage = location === "/login" || location === "/register";

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <BrandLogo className="text-lg md:text-xl" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2">
                      Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
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
                      <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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

          {/* Mobile hamburger */}
          {!isLoading && !isAuthPage && (
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-foreground transition-colors hover:bg-white/10"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-xl"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/30 border border-white/5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={closeMenu}>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-left">
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={() => { logout(); closeMenu(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-destructive/10 text-destructive transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMenu}>
                    <button className="w-full px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <Button className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20 h-11">
                      Get Started — It's Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
