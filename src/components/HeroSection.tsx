import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight font-display text-foreground">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
            Share Files
          </span>
          <br />
          <span className="text-3xl md:text-4xl font-light text-muted-foreground mt-2 block">
            Across the World
          </span>
        </h2>

        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground pt-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono font-medium tracking-wide text-xs border border-primary/20">
            SRGEC
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span>Instant P2P Transfer</span>
        </div>
      </div>

      <p className="text-base text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
        Secure, private, and lightning-fast file sharing. No accounts, no limits, complete privacy.
      </p>
    </div>
  );
};
