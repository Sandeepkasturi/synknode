import React from "react";
import { QueueProvider } from "../context/QueueContext";
import { HeroSection } from "../components/HeroSection";
import { MainTabs } from "../components/MainTabs";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { motion } from "framer-motion";
import Hyperspeed, { hyperspeedPresets } from "../components/Hyperspeed";

const Index: React.FC = () => {
  return (
    <QueueProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Hyperspeed background */}
        <div className="fixed inset-0 z-0">
          <Hyperspeed effectOptions={hyperspeedPresets.one} />
        </div>
        
        {/* Overlay for readability */}
        <div className="fixed inset-0 z-[1] bg-background/60 backdrop-blur-[1px]" />
        
        <Header />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container max-w-4xl mx-auto px-4 pt-24 pb-12 relative z-10"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7, type: "spring", stiffness: 100 }}
          >
            <HeroSection />
          </motion.div>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="glass rounded-2xl shadow-2xl p-6 md:p-8"
          >
            <MainTabs />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <Footer />
          </motion.div>
        </motion.div>
      </div>
    </QueueProvider>
  );
};

export default Index;
