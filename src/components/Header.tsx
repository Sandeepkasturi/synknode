import React, { useState } from 'react';
import { Moon, Sun, Menu, X, Send, ListChecks, ChartNoAxesColumn, Settings, ShieldCheck, Home, MoreHorizontal, Sparkles, Info } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { BrandMark } from '@/components/BrandMark';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { pathname, search } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const view = new URLSearchParams(search).get('view') || 'transfer';
  const nav = [
    { to: '/', label: 'Transfer', mobile: 'Home', icon: Send, mobileIcon: Home, key: 'transfer' },
    { to: '/?view=activity', label: 'Activity', mobile: 'Activity', icon: ListChecks, mobileIcon: ListChecks, key: 'activity' },
    { to: '/?view=analytics', label: 'Analytics', mobile: 'Analytics', icon: ChartNoAxesColumn, mobileIcon: ChartNoAxesColumn, key: 'analytics' },
    { to: '/?view=settings', label: 'Settings', mobile: 'More', icon: Settings, mobileIcon: MoreHorizontal, key: 'settings' },
  ];
  const links = (mobile = false) => nav.map(item => {
    const Icon = mobile ? item.mobileIcon : item.icon;
    const active = pathname === '/' && view === item.key;
    return <Button key={item.key} asChild variant="ghost" className={`${mobile ? 'bottom-nav-link' : 'rail-link'} ${active ? 'is-active' : ''}`}><Link to={item.to} onClick={() => setMobileOpen(false)} aria-current={active ? 'page' : undefined}><Icon className="h-4 w-4" /><span>{mobile ? item.mobile : item.label}</span></Link></Button>;
  });
  return <>
    <header className="app-header">
      <Link to="/" className="flex items-center gap-2" aria-label="SynkNode home"><BrandMark /><div><p className="text-base font-bold leading-tight">SynkNode</p><p className="brand-caption">Secure transfer</p></div></Link>
      <nav className="desktop-navigation" aria-label="Primary navigation">{links()}</nav>
      <div className="rail-protection"><ShieldCheck className="h-5 w-5 text-success" /><div><p className="text-xs font-semibold">Protected transfers</p><p className="mt-1 text-[10px] text-muted-foreground">File safety checks</p></div></div>
      <Button variant="ghost" onClick={toggleTheme} className="rail-theme" aria-label="Toggle theme">{theme === 'dark' ? <Moon /> : <Sun />}<span>{theme === 'dark' ? 'Dark theme' : 'Light theme'}</span><span className={`theme-indicator ${theme === 'dark' ? 'is-on' : ''}`} /></Button>
      <Button variant="secondary" size="icon" className="mobile-menu" onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>{mobileOpen ? <X /> : <Menu />}</Button>
      {mobileOpen && <nav className="mobile-drawer" aria-label="Mobile menu">{links()}<div className="border-t border-border pt-3"><Button asChild variant="ghost"><Link to="/features"><Sparkles />Features</Link></Button><Button asChild variant="ghost"><Link to="/about"><Info />About</Link></Button><Button variant="ghost" onClick={toggleTheme}>{theme === 'dark' ? <Moon /> : <Sun />} {theme === 'dark' ? 'Dark theme' : 'Light theme'}</Button></div></nav>}
    </header>
    <nav className="bottom-navigation" aria-label="Mobile primary navigation">{links(true)}</nav>
  </>;
};
