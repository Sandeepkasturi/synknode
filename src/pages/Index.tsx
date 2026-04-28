import React from "react";
import { QueueProvider } from "../context/QueueContext";
import { MainTabs } from "../components/MainTabs";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Share2, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Index: React.FC = () => {
  const navItems = ["Home", "Features", "About"];

  return (
    <QueueProvider>
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
        </video>

        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <Link
            to="/"
            className="font-display text-3xl tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Velorah<sup className="text-xs">®</sup>
          </Link>

          <div className="hidden md:flex items-center gap-8 liquid-glass rounded-full px-6 py-3 text-sm">
            {navItems.map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className={item === "Home" ? "text-foreground" : "text-muted-foreground hover:text-foreground transition-colors"}
              >
                {item}
              </Link>
            ))}
          </div>

          <Button className="liquid-glass rounded-full px-6 py-2.5 text-sm font-medium text-foreground bg-transparent hover:bg-transparent hover:scale-[1.03] transition-transform">
            Begin Journey
          </Button>
        </nav>

        <main className="relative z-10 flex min-h-[calc(100vh-96px)] flex-col items-center text-center px-6 pt-24 sm:pt-32 pb-28 sm:pb-40">
          <h1
            className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl text-balance"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Where <em className="not-italic text-muted-foreground">dreams</em> rise{' '}
            <em className="not-italic text-muted-foreground">through the silence.</em>
          </h1>

          <p className="animate-fade-rise max-w-2xl mt-8 text-base sm:text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "160ms" }}>
            A cinematic file-sharing space for sending, previewing, and receiving documents with quiet precision.
          </p>

          <Button className="animate-fade-rise liquid-glass rounded-full px-14 py-5 mt-12 h-auto bg-transparent text-foreground hover:bg-transparent hover:scale-[1.03] transition-transform" style={{ animationDelay: "320ms" }}>
            Start Sharing
          </Button>

          <div className="relative mt-16 w-full max-w-2xl animate-fade-rise" style={{ animationDelay: "460ms" }}>
            <div className="liquid-glass rounded-[2rem] p-4 sm:p-6 text-left">
              <MainTabs />
            </div>
          </div>
        </main>

        <div className="pointer-events-none absolute bottom-6 left-4 right-4 z-10 mx-auto flex max-w-7xl items-end justify-between gap-4">
          <div className="liquid-glass hidden sm:block rounded-3xl p-4 text-left w-72">
            <div className="flex items-center gap-3">
              <div className="liquid-glass rounded-2xl p-3"><FileText className="h-5 w-5" /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">project-vision.pdf</p>
                <p className="text-xs text-muted-foreground">Uploaded • 2.4 MB</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full w-2/3 rounded-full bg-foreground/70 progress-shimmer" />
            </div>
          </div>

          <div className="hidden lg:block liquid-glass rounded-3xl p-4 text-left w-64">
            <p className="text-sm font-medium">Preview ready</p>
            <p className="mt-1 text-xs text-muted-foreground">Today, 13:48 • Secure queue</p>
          </div>

          <div className="hidden sm:flex flex-col gap-3">
            {[Upload, Share2, Eye].map((Icon, index) => (
              <div key={index} className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full">
                <Icon className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </QueueProvider>
  );
};

export default Index;
