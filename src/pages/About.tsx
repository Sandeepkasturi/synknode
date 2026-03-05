import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Github, Globe, Mail } from 'lucide-react';
import logo from '@/assets/logo.png';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <Header />
      <main className="container max-w-2xl mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Brand */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mx-auto">
              <img src={logo} alt="SynkNode" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              About SynkNode
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              A fast, secure, and minimal file sharing tool — built for simplicity.
            </p>
          </div>

          {/* Story */}
          <div className="p-6 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm space-y-4">
            <h2 className="font-display font-semibold text-lg text-foreground">The Story</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SynkNode was born from the frustration of complicated file sharing tools. We wanted something 
              that just works — drop your files, share them securely, and move on. No accounts, no bloat, 
              no unnecessary steps.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built with a hybrid architecture combining peer-to-peer connections with cloud storage, 
              SynkNode ensures your files always reach their destination — whether the receiver is online 
              or offline at the time of sending.
            </p>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Max Size', value: '5GB/user' },
              { label: 'Users/Hour', value: '50' },
              { label: 'Auth', value: 'Receiver-side' },
              { label: 'Architecture', value: 'Hybrid P2P' },
            ].map(spec => (
              <div key={spec.label} className="p-4 rounded-xl border border-border/50 bg-secondary/20 text-center">
                <p className="text-lg font-display font-bold text-primary">{spec.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{spec.label}</p>
              </div>
            ))}
          </div>

          {/* Creator */}
          <div className="p-6 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm space-y-4">
            <h2 className="font-display font-semibold text-lg text-foreground">Built by</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-display font-bold text-primary">SK</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Sandeep Kasturi</p>
                <p className="text-xs text-muted-foreground">SKAV TECH · Full-stack Developer</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              {[
                { icon: Globe, href: 'https://skavtechs.vercel.app', label: 'Website' },
                { icon: Github, href: 'https://github.com/sandeepkasturi', label: 'GitHub' },
                { icon: Mail, href: 'mailto:skavtech.in@gmail.com', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-border/50"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
