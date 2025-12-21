import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105">
                <img
                  src={logo}
                  alt="SynkNode"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-foreground font-display leading-none">
                SynkNode
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium pt-0.5">Secure Transfer</p>
            </div>
          </div>

          {/* Navigation and Theme Toggle */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </nav>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-9 h-9 hover:bg-secondary transition-colors"
            >
              <div className="transition-transform duration-500 rotate-0 dark:rotate-180">
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-foreground" />
                )}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
