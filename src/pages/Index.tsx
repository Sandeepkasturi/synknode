import React from "react";
import { QueueProvider } from "../context/QueueContext";
import { HeroSection } from "../components/HeroSection";
import { MainTabs } from "../components/MainTabs";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { AnalyticsBar } from "../components/AnalyticsBar";

const Index: React.FC = () => {
  return (
    <QueueProvider>
      <div className="min-h-screen bg-background selection:bg-primary/20 xl:pl-60">
        <Header />

        <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 xl:px-10 xl:pt-10">
          <div className="mb-6 flex items-center justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Transfer workspace</p><p className="mt-1 text-xs text-muted-foreground">Live status and secure delivery</p></div>
            <div className="ember-rail h-1 w-24 rounded-full bg-secondary" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className="min-h-[380px] border border-border bg-card p-7 lg:col-span-7 lg:p-10">
              <HeroSection />
            </section>
            <div className="lg:col-span-5">
              <AnalyticsBar />
            </div>
            <section className="border border-border bg-card p-5 sm:p-7 lg:col-span-12">
              <MainTabs />
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </QueueProvider>
  );
};

export default Index;
