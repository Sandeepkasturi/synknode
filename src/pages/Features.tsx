import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Zap, HardDrive, Users, Upload, Download, Lock, Globe } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Hybrid P2P + cloud delivery ensures your files arrive in seconds, not minutes.'
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'End-to-end encryption with authenticated receiver access. Your files stay private.'
  },
  {
    icon: HardDrive,
    title: '5GB Per User',
    description: 'Upload up to 5GB of data per session — plenty for large projects and media files.'
  },
  {
    icon: Users,
    title: '50 Users Per Hour',
    description: 'Supports up to 50 concurrent senders per hour with organized queue management.'
  },
  {
    icon: Upload,
    title: 'Drag & Drop',
    description: 'Simply drag files into the browser or click to browse. No complicated setup needed.'
  },
  {
    icon: Download,
    title: 'Individual Downloads',
    description: 'Files are downloaded individually with sender attribution — no confusing zip files.'
  },
  {
    icon: Lock,
    title: 'Receiver Authentication',
    description: 'Only authorized receivers can access files. Admin manages receiver credentials.'
  },
  {
    icon: Globe,
    title: 'No Sign-up Required',
    description: 'Senders can share files instantly with just their name. Zero friction file sharing.'
  }
];

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Features
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need for secure, fast, and organized file sharing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="p-5 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
