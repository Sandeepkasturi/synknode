import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy: React.FC = () => (
  <div className="min-h-screen bg-background xl:pl-60">
    <Header />
    <main className="container max-w-3xl mx-auto px-4 pt-24 pb-16 xl:pt-12">
      <h1 className="text-3xl font-display font-bold mb-6 text-foreground">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>SynkNode is designed with privacy as a first principle. We do not sell, share, or retain your files after they are delivered to the intended receiver.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Data we handle</h2>
        <p>Uploaded files are stored temporarily in encrypted cloud storage and deleted immediately after the receiver downloads them. We do not read, index, or analyze file contents.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Analytics</h2>
        <p>We collect minimal, anonymized usage analytics (page views, feature usage) to improve the product. No personally identifying information is collected without consent.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Contact</h2>
        <p>Questions? Reach us at <a className="text-primary hover:underline" href="mailto:skavtech.in@gmail.com">skavtech.in@gmail.com</a>.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
