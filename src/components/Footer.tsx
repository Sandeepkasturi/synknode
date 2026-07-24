import React from 'react';
import { Github, Globe, Mail, ExternalLink, Linkedin, Twitter, Shield, FileText, Sparkles, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import skavtechLogo from '@/assets/skavtech-logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/40 mt-16 bg-gradient-to-b from-transparent to-secondary/30" id="about">
      <div className="container max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* LEFT: SynkNode / Developer / Product Links */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-primary/20 shadow-sm">
                <img src={logo} alt="SynkNode" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground leading-none">SynkNode</h3>
                <p className="text-[11px] text-muted-foreground mt-1">Secure, instant file transfer</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Built and maintained by{' '}
              <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                Sandeep Kasturi
              </a>
              . Files are scanned, encrypted in transit, and never persisted after delivery.
            </p>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Product & Legal</p>
              <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                <li>
                  <Link to="/features" className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition-colors">
                    <Sparkles className="w-3 h-3" /> Features
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition-colors">
                    <Info className="w-3 h-3" /> About
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition-colors">
                    <Shield className="w-3 h-3" /> Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition-colors">
                    <FileText className="w-3 h-3" /> Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <a href="https://github.com/sandeepkasturi" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Github className="w-3.5 h-3.5" />
              </a>
              <a href="mailto:skavtech.in@gmail.com" aria-label="Email"
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer" aria-label="Website"
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* RIGHT: Company panel — themed */}
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-card to-card/80 p-4 md:p-5 border border-border/60 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />

              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-white to-blue-50 p-1.5 flex items-center justify-center ring-2 ring-primary/20 shadow-md">
                    <img
                      src={skavtechLogo}
                      alt="SKAV TECH — AI Innovation Lab"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-primary/70 mb-1">Powered By</p>
                    <h3 className="font-display font-bold text-lg md:text-xl text-foreground leading-tight">SKAV TECH</h3>
                    <p className="text-xs text-muted-foreground/90 mt-0.5">AI Innovation</p>
                  </div>
                </div>

                <p className="relative text-[11px] text-muted-foreground/80 leading-relaxed">
                  Privacy-first tools for modern creators.
                </p>

                <div className="relative pt-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary/50 hover:bg-primary/20 border border-border/50 text-muted-foreground hover:text-primary transition" title="Website">
                      <Globe className="w-3 h-3" />
                    </a>
                    <a href="https://github.com/sandeepkasturi" target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary/50 hover:bg-primary/20 border border-border/50 text-muted-foreground hover:text-primary transition" title="GitHub">
                      <Github className="w-3 h-3" />
                    </a>
                    <a href="https://www.linkedin.com/in/sandeepkasturi/" target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary/50 hover:bg-primary/20 border border-border/50 text-muted-foreground hover:text-primary transition" title="LinkedIn">
                      <Linkedin className="w-3 h-3" />
                    </a>
                    <a href="https://twitter.com/skavtech" target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary/50 hover:bg-primary/20 border border-border/50 text-muted-foreground hover:text-primary transition" title="Twitter">
                      <Twitter className="w-3 h-3" />
                    </a>
                    <a href="mailto:skavtech.in@gmail.com"
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/20 text-muted-foreground hover:text-primary transition" title="Email">
                      <Mail className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} SynkNode · A <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">SKAV TECH</a> Project
          </p>
          <p className="text-[10px] text-muted-foreground/60">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
