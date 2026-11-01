import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { QueueProvider } from '@/context/QueueContext';
import { MainTabs } from '@/components/MainTabs';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AnalyticsBar } from '@/components/AnalyticsBar';
import { SenderQueue } from '@/components/sender/SenderQueue';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/BrandMark';
import { Moon, Sun, Info, Sparkles, Shield, FileText } from 'lucide-react';

const Index: React.FC = () => {
  const [params] = useSearchParams();
  const view = params.get('view') || 'transfer';
  const { theme, toggleTheme } = useTheme();
  return <QueueProvider><div className="app-shell min-h-screen bg-background"><Header /><main className={`app-workspace ${view === 'transfer' ? 'transfer-workspace' : ''}`}>
    <div className={view === 'transfer' ? '' : 'hidden'}><MainTabs /></div>
    {view === 'activity' && <><div className="workspace-heading"><h1>Transfer Activity</h1><p>Live files awaiting delivery to SRGEC.</p></div><SenderQueue searchable /></>}
    {view === 'analytics' && <><div className="workspace-heading"><h1>Transfer Analytics</h1><p>Live platform totals.</p></div><AnalyticsBar /></>}
    {view === 'settings' && <><div className="workspace-heading"><h1>Settings</h1><p>Make SynkNode yours.</p></div><div className="space-y-3 max-w-xl"><div className="settings-row"><span className="flex items-center gap-3 text-sm font-medium">{theme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}Appearance</span><Button variant="outline" onClick={toggleTheme} className="rounded-full h-9">{theme === 'dark' ? 'Dark theme' : 'Light theme'}</Button></div><div className="grid grid-cols-2 gap-3">{[{to:'/features',label:'Features',icon:Sparkles},{to:'/about',label:'About',icon:Info},{to:'/privacy',label:'Privacy',icon:Shield},{to:'/terms',label:'Terms',icon:FileText}].map(({to,label,icon:Icon}) => <Button asChild key={to} variant="ghost" className="settings-row justify-between h-auto font-medium hover:bg-primary/5"><Link to={to} className="flex items-center justify-between w-full"><span className="flex items-center gap-3"><Icon className="h-4 w-4 text-primary" />{label}</span><span className="text-muted-foreground">›</span></Link></Button>)}</div><div className="glass-card p-5 flex items-center gap-4 mt-2"><BrandMark animated={false} /><div><p className="text-sm font-semibold">SynkNode</p><p className="text-xs text-muted-foreground mt-0.5">Secure, instant file transfer — built by <span className="text-primary font-medium">Sandeep Kasturi</span></p></div></div></div></>}
  </main><Footer /></div></QueueProvider>;
};
export default Index;
