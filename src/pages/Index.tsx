import React from "react";
import { QueueProvider } from "../context/QueueContext";
import { HeroSection } from "../components/HeroSection";
import { MainTabs } from "../components/MainTabs";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

const Index: React.FC = () => {
  return (
    <QueueProvider>
      <div className="min-h-screen bg-background relative selection:bg-primary/20">
        {/* Subtle nice background gradient */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-[#0a0a0a] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] [background-size:16px_16px]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] dark:bg-[radial-gradient(circle_800px_at_100%_200px,#4c1d95,transparent)] opacity-40"></div>
        </div>

        <Header />

        <main className="container max-w-5xl mx-auto px-4 pt-32 pb-16">
          <div className="flex flex-col items-center gap-12">
            <HeroSection />

            <div className="w-full max-w-3xl glass-card rounded-2xl shadow-sm border border-border/50 bg-card/50 backdrop-blur-xl p-1">
              <MainTabs />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </QueueProvider>
  );
};

export default Index;
