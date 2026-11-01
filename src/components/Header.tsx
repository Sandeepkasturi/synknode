import React from 'react';
import { Moon, Sun, Send, ListChecks, ChartNoAxesColumn, Settings, ShieldCheck, Bell } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { BrandMark } from '@/components/BrandMark';
import { toast } from 'sonner';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { pathname, search } = useLocation();
  const view = new URLSearchParams(search).get('view') || 'transfer';
  const nav = [
    { to: '/', label: 'Transfer', mobile: 'Transfer', icon: Send, key: 'transfer' },
    { to: '/?view=activity', label: 'Activity', mobile: 'Activity', icon: ListChecks, key: 'activity' },
    { to: '/?view=analytics', label: 'Analytics', mobile: 'Analytics', icon: ChartNoAxesColumn, key: 'analytics' },
    { to: '/?view=settings', label: 'Settings', mobile: 'Settings', icon: Settings, key: 'settings' },
  ];
  const links = (mobile = false) => nav.map(item => {
    const Icon = item.icon;
    const active = pathname === '/' && view === item.key;
    return <Button key={item.key} asChild variant="ghost" className={`${mobile ? 'bottom-nav-link' : 'rail-link'} ${active ? 'is-active' : ''}`}><Link to={item.to} aria-current={active ? 'page' : undefined}><Icon className="h-4 w-4" /><span>{item.label}</span></Link></Button>;
  });
  return <>
    <header className="app-header">
      <Link to="/" className="flex items-center gap-2" aria-label="SynkNode home"><BrandMark /><div><p className="text-base font-bold leading-tight">SynkNode</p><p className="brand-caption">Secure transfer</p></div></Link>
      <nav className="desktop-navigation" aria-label="Primary navigation">{links()}</nav>
      <div className="rail-protection"><ShieldCheck className="h-5 w-5 text-success" /><div><p className="text-xs font-semibold">Protected transfers</p><p className="mt-1 text-[10px] text-muted-foreground">File safety checks</p></div></div>
      <Button variant="ghost" onClick={toggleTheme} className="rail-theme" aria-label="Toggle theme">{theme === 'dark' ? <Moon /> : <Sun />}<span>{theme === 'dark' ? 'Dark theme' : 'Light theme'}</span><span className={`theme-indicator ${theme === 'dark' ? 'is-on' : ''}`} /></Button>
      <div className="mobile-topbar-actions">
        <button type="button" className="topbar-icon-button" aria-label="Notifications" onClick={() => toast.info("You're all caught up")}>
          <Bell />
          <span className="topbar-notification-dot" />
        </button>
        <Link to="/?view=settings" className="topbar-avatar" aria-label="Open settings">S</Link>
      </div>
    </header>
    <nav className="bottom-navigation" aria-label="Mobile primary navigation">{links(true)}</nav>
  </>;
};
