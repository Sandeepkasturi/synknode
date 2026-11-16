import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Info, Sparkles, Shield, FileText, Send, ListChecks, ChartNoAxesColumn, Settings, Signal, Wifi, BatteryFull, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/BrandMark';
import { MainTabs } from '@/components/MainTabs';
import { SenderQueue } from '@/components/sender/SenderQueue';
import { AnalyticsBar } from '@/components/AnalyticsBar';
import { useTheme } from '@/context/ThemeContext';

const navItems = [
  { to: '/', label: 'Transfer', icon: Send, key: 'transfer' },
  { to: '/?view=activity', label: 'Activity', icon: ListChecks, key: 'activity' },
  { to: '/?view=analytics', label: 'Analytics', icon: ChartNoAxesColumn, key: 'analytics' },
  { to: '/?view=settings', label: 'Settings', icon: Settings, key: 'settings' },
];

function DeviceStatus() {
  return <div className="device-status" aria-label="Device status"><span>9:41</span><span className="device-status-icons"><Signal /><Wifi /><BatteryFull /></span></div>;
}

function DeviceNav({ active }: { active: string }) {
  return <nav className="device-nav" aria-label={`${active} screen navigation`}>
    {navItems.map(({ to, label, icon: Icon, key }) => <Link key={key} to={to} className={active === key ? 'is-active' : ''} aria-current={active === key ? 'page' : undefined}><Icon /><span>{label}</span></Link>)}
  </nav>;
}

function SettingsPanel() {
  const { theme, toggleTheme } = useTheme();
  const links = [
    { to: '/features', label: 'Notifications', detail: 'Manage notifications', icon: Sparkles },
    { to: '/privacy', label: 'Privacy & Security', detail: 'Encryption, safety checks', icon: Shield },
    { to: '/features', label: 'Transfer Preferences', detail: 'Default destination, options', icon: Settings },
    { to: '/about', label: 'About', detail: 'App version 1.0.0', icon: Info },
    { to: '/terms', label: 'Terms & Conditions', detail: 'Your terms of service', icon: FileText },
  ];
  return <div className="settings-content">
    <button type="button" className="showcase-setting" onClick={toggleTheme}>
      {theme === 'dark' ? <Moon /> : <Sun />}<span><strong>Appearance</strong><small>Choose your theme</small></span><ChevronRight />
    </button>
    <div className="theme-choices" aria-label="Theme selection">
      {['Light', 'Dark'].map((choice) => <button type="button" key={choice} className={(choice === 'Dark' && theme === 'dark') || (choice === 'Light' && theme !== 'dark') ? 'is-selected' : ''} onClick={() => { if ((choice === 'Dark') !== (theme === 'dark')) toggleTheme(); }} aria-pressed={(choice === 'Dark' && theme === 'dark') || (choice === 'Light' && theme !== 'dark')}>
        {choice === 'Dark' ? <Moon /> : <Sun />}<span>{choice}</span>
      </button>)}
    </div>
    <div className="settings-links">{links.map(({ to, label, detail, icon: Icon }) => <Link key={label} to={to} className="showcase-setting"><Icon /><span><strong>{label}</strong><small>{detail}</small></span><ChevronRight /></Link>)}</div>
    <div className="settings-brand"><BrandMark animated={false} /><span><strong>SynkNode</strong><small>Secure file transfers, made simple.</small></span></div>
  </div>;
}

function ScreenFrame({ name, title, subtitle, children }: { name: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="showcase-screen" data-view={name} aria-label={`${title} screen`}>
    <DeviceStatus />
    <div className="device-brand"><BrandMark animated={false} /><span>SynkNode</span><span className="device-avatar">S</span></div>
    <div className="device-heading"><h2>{title}</h2><p>{subtitle}</p></div>
    <div className="device-content">{children}</div>
    <DeviceNav active={name} />
  </section>;
}

export function SynkNodeShowcase({ activeView }: { activeView: string }) {
  return <main className="showcase-grid" data-active-view={activeView}>
    <ScreenFrame name="transfer" title="Transfer Files" subtitle="Send securely to your destination"><MainTabs /></ScreenFrame>
    <ScreenFrame name="activity" title="Activity" subtitle="Track your file transfers"><SenderQueue searchable /></ScreenFrame>
    <ScreenFrame name="analytics" title="Analytics" subtitle="Your transfer insights"><AnalyticsBar /></ScreenFrame>
    <ScreenFrame name="settings" title="Settings" subtitle="Customize your experience"><SettingsPanel /></ScreenFrame>
  </main>;
}
