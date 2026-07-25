import React from 'react';
import { Github, Globe, Mail, ExternalLink, Linkedin, Shield, FileText, Sparkles, Info } from 'lucide-react';
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
            <div className="rounded-2xl bg-card p-6 md:p-7 border border-border shadow-md overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

              <div className="relative flex items-center gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl bg-white p-2 flex items-center justify-center ring-1 ring-border shadow-sm">
                  <img
                    src={skavtechLogo}
                    alt="SKAV TECH — AI Innovation Lab"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary/80 mb-1">A Project By</p>
                  <h3 className="font-display font-bold text-xl md:text-2xl text-foreground leading-tight">SKAV TECH</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">AI Innovation Lab</p>
                </div>
              </div>

              <p className="relative text-xs text-muted-foreground leading-relaxed mt-5">
                We build intelligent, privacy-first tools for creators and teams —
                combining thoughtful design with modern AI infrastructure.
              </p>

              <div className="relative mt-5 pt-5 border-t border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Company Links</p>
                <div className="grid grid-cols-2 gap-2">
                  <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer"
                    className="group inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground transition">
                    <span className="inline-flex items-center gap-1.5"><Globe className="w-3 h-3" /> Website</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
                  <a href="https://github.com/sandeepkasturi" target="_blank" rel="noopener noreferrer"
                    className="group inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground transition">
                    <span className="inline-flex items-center gap-1.5"><Github className="w-3 h-3" /> GitHub</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
                  <a href="https://linkedin.com/in/sandeepkasturi9" target="_blank" rel="noopener noreferrer"
                    className="group inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground transition">
                    <span className="inline-flex items-center gap-1.5"><Linkedin className="w-3 h-3" /> LinkedIn</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
                  <a href="mailto:skavtech.in@gmail.com"
                    className="group col-span-2 inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-xs text-foreground transition">
                    <span className="inline-flex items-center gap-1.5"><Mail className="w-3 h-3" /> skavtech.in@gmail.com</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
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
