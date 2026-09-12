import React, { useState } from 'react';
import { Moon, Sun, Menu, X, Home, Sparkles, Info, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { BrandMark } from '@/components/BrandMark';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/features', label: 'Features', icon: Sparkles },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/95 xl:inset-y-0 xl:right-auto xl:w-60 xl:border-b-0 xl:border-r">
      <div className="flex h-16 items-center justify-between px-4 xl:h-full xl:flex-col xl:items-stretch xl:px-5 xl:py-7">
        <Link to="/" className="group flex items-center gap-3" aria-label="SynkNode home">
          <BrandMark className="scale-90" />
          <div className="leading-none">
            <p className="font-display text-lg font-bold text-foreground">SynkNode</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Secure transfer</p>
          </div>
        </Link>

        <nav className="mt-12 hidden flex-1 space-y-1 xl:block" aria-label="Primary navigation">
            {nav.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden border-t border-border pt-5 xl:block">
            <div className="mb-4 flex items-center gap-2 rounded-md bg-secondary px-3 py-2.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div><p className="text-xs font-semibold">Protected uploads</p><p className="text-[10px] text-muted-foreground">File safety active</p></div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start gap-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === 'dark' ? 'Dark theme' : 'Light theme'}
            </Button>
          </div>

          <div className="flex items-center gap-1 xl:hidden">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(v => !v)}
              className="rounded-md"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        {mobileOpen && (
          <nav className="absolute inset-x-0 top-16 flex flex-col border-b border-border bg-card p-3 shadow-lg xl:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-3 py-3 text-sm font-semibold ${
                  pathname === item.to ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
