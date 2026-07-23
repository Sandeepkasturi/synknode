import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms: React.FC = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container max-w-3xl mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-display font-bold mb-6 text-foreground">Terms & Conditions</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>By using SynkNode you agree to use the service responsibly and in accordance with all applicable laws.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Acceptable use</h2>
        <p>You may not upload malicious files, copyrighted material you do not own, or content that violates the rights of others. Our automated safety layer will block many risky file types, but you remain responsible for what you share.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Limits</h2>
        <p>Free usage is capped at 50MB per file and 5GB of total transferred data per user. Limits may change without notice.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Liability</h2>
        <p>SynkNode is provided "as is" without warranties of any kind. SKAV TECH is not liable for any indirect or consequential damages arising from use of the service.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Contact</h2>
        <p>For legal inquiries, contact <a className="text-primary hover:underline" href="mailto:skavtech.in@gmail.com">skavtech.in@gmail.com</a>.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
