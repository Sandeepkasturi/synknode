import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Bell, Zap, Users, Send, ListChecks, ChartNoAxesColumn, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/BrandMark';
import { toast } from 'sonner';

const nav = [
  { to: '/', label: 'Transfer', icon: Send, key: 'transfer' },
  { to: '/?view=activity', label: 'Activity', icon: ListChecks, key: 'activity' },
  { to: '/?view=analytics', label: 'Analytics', icon: ChartNoAxesColumn, key: 'analytics' },
  { to: '/?view=settings', label: 'Settings', icon: Settings, key: 'settings' },
];

export const Header: React.FC = () => {
  const { pathname, search } = useLocation();
  const view = new URLSearchParams(search).get('view') || 'transfer';
  const links = nav.map((item) => {
    const active = pathname === '/' && view === item.key;
    const Icon = item.icon;
    return <Button key={item.key} asChild variant="ghost" className={`bottom-nav-link ${active ? 'is-active' : ''}`}><Link to={item.to} aria-current={active ? 'page' : undefined}><Icon aria-hidden="true" /><span>{item.label}</span></Link></Button>;
  });

  return <>
    <header className="app-header">
      <Link to="/" className="showcase-logo" aria-label="SynkNode home"><BrandMark /><span><strong>SynkNode</strong><small>Secure · Fast · Seamless</small></span></Link>
      <div className="showcase-headline"><strong>Transfer Smarter.</strong><strong>Share Better.</strong></div>
      <div className="showcase-badges" aria-label="SynkNode benefits">
        <span><ShieldCheck />End-to-End Encrypted</span><span><Zap />Blazing Fast P2P</span><span><Users />Built for Everyone</span>
      </div>
      <div className="mobile-topbar-actions"><button type="button" className="topbar-icon-button" aria-label="Notifications" onClick={() => toast.info("You're all caught up")}><Bell /><span className="topbar-notification-dot" /></button><Link to="/?view=settings" className="topbar-avatar" aria-label="Open settings">S</Link></div>
    </header>
    <nav className="bottom-navigation" aria-label="Mobile primary navigation">{links}</nav>
  </>;
};
