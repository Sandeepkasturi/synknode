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
        <Header />

        <main className="container max-w-2xl mx-auto px-4 pt-28 pb-16">
          <div className="flex flex-col items-center gap-10">
            <HeroSection />

            <div className="w-full rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
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
