import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "synknode-install-prompt-dismissed";
let deferredPrompt: InstallPromptEvent | null = null;
const promptListeners = new Set<(event: InstallPromptEvent | null) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    promptListeners.forEach(listener => listener(deferredPrompt));
  });
}

function getPlatform() {
  const userAgent = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(deferredPrompt);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === "true");
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [installed, setInstalled] = useState(() =>
    window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true,
  );
  const platform = getPlatform();

  useEffect(() => {
    const receivePrompt = (event: InstallPromptEvent | null) => setInstallEvent(event);
    const handleInstalled = () => {
      setInstalled(true);
      deferredPrompt = null;
    };

    promptListeners.add(receivePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      promptListeners.delete(receivePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  const install = async () => {
    if (!installEvent) {
      setInstructionsOpen(open => !open);
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    deferredPrompt = null;
    setInstallEvent(null);
    if (choice?.outcome === "accepted") setInstalled(true);
  };

  if (dismissed || installed) return null;

  const description = platform === "android"
    ? "Install SynkNode to receive files directly from your phone’s Share menu."
    : platform === "ios"
      ? "Add SynkNode to your Home Screen for quick access. Use the in-app picker to share files from iPhone."
      : "Install SynkNode for quick access. Installed Android users can share files into SynkNode from other apps.";

  const instructions = platform === "ios"
    ? "In Safari, tap Share, then Add to Home Screen. iOS does not offer installed web apps as file-sharing destinations; choose files from inside SynkNode."
    : platform === "android"
      ? "Open your browser menu and choose Install app or Add to Home screen. After installation, SynkNode can appear in Android’s Share menu."
      : "Use the install icon in your browser’s address bar or choose Install app from the browser menu.";

  return <aside className="install-prompt glass-card" aria-label="Install SynkNode">
    <div className="install-prompt-icon" aria-hidden="true"><Smartphone /></div>
    <div className="install-prompt-copy">
      <p className="install-prompt-title">Install SynkNode</p>
      <p className="install-prompt-description">{description}</p>
      {instructionsOpen && <p className="install-prompt-instructions">{instructions}</p>}
      <Button size="sm" onClick={install} className="install-prompt-action">
        <Download aria-hidden="true" />{installEvent ? "Install app" : platform === "ios" ? "Add to Home Screen" : "How to install"}
      </Button>
    </div>
    <Button variant="ghost" size="icon" className="install-prompt-close" aria-label="Dismiss install prompt" onClick={dismiss}>
      <X aria-hidden="true" />
    </Button>
  </aside>;
}