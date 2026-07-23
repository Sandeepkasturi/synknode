import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import logo from '@/assets/logo.png';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = [
    { to: '/', label: 'Home' },
    { to: '/features', label: 'Features' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 px-3">
      <div
        className={`container max-w-5xl mx-auto rounded-2xl border transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-border/60 shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.25)]'
            : 'bg-background/50 backdrop-blur-md border-border/30'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-9 h-9 rounded-lg overflow-hidden ring-1 ring-primary/20 shadow-sm">
                <img src={logo} alt="SynkNode" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="leading-none">
              <h1 className="text-base font-bold tracking-tight text-foreground font-display">SynkNode</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide uppercase">Secure Transfer</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-secondary/40 border border-border/40">
            {nav.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-primary shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.6)]" />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-9 h-9 hover:bg-primary/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden rounded-full w-9 h-9"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 p-2 flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  pathname === item.to ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
