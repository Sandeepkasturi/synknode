import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="container max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
              <img src={logo} alt="SynkNode" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground font-display leading-none">
                SynkNode
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">File Transfer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-5">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </nav>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-8 h-8"
            >
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
