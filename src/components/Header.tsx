import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/40 border-b border-border/30"
    >
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                <img
                  src={logo}
                  alt="SynkNode"
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                SynkNode
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Secure P2P Transfer</p>
            </div>
          </motion.div>

          {/* Navigation and Theme Toggle */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </nav>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full bg-secondary/50 border-border/50 hover:bg-secondary"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4 text-primary" />
                  ) : (
                    <Sun className="h-4 w-4 text-primary" />
                  )}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
