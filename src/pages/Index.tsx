import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { QueueProvider } from '@/context/QueueContext';
import { MainTabs } from '@/components/MainTabs';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AnalyticsBar } from '@/components/AnalyticsBar';
import { SenderQueue } from '@/components/sender/SenderQueue';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, Info, Sparkles, Shield, FileText } from 'lucide-react';

const Index: React.FC = () => {
  const [params] = useSearchParams();
  const view = params.get('view') || 'transfer';
  const { theme, toggleTheme } = useTheme();
  return <QueueProvider><div className="app-shell min-h-screen bg-background"><Header /><main className={`app-workspace ${view === 'transfer' ? 'transfer-workspace' : ''}`}>
    <div className={view === 'transfer' ? '' : 'hidden'}><MainTabs /></div>
    {view === 'activity' && <><div className="workspace-heading"><h1>Transfer Activity</h1><p>Live files awaiting delivery to SRGEC.</p></div><SenderQueue searchable /></>}
    {view === 'analytics' && <><div className="workspace-heading"><h1>Transfer Analytics</h1><p>Live platform totals.</p></div><AnalyticsBar /></>}
    {view === 'settings' && <><div className="workspace-heading"><h1>Settings</h1></div><div className="settings-row"><span className="text-sm">Appearance</span><Button variant="outline" onClick={toggleTheme}>{theme === 'dark' ? <Moon /> : <Sun />}{theme === 'dark' ? 'Dark theme' : 'Light theme'}</Button></div><div className="mt-6 grid grid-cols-2 gap-3">{[{to:'/features',label:'Features',icon:Sparkles},{to:'/about',label:'About',icon:Info},{to:'/privacy',label:'Privacy',icon:Shield},{to:'/terms',label:'Terms',icon:FileText}].map(({to,label,icon:Icon}) => <Button asChild key={to} variant="outline" className="justify-start"><Link to={to}><Icon />{label}</Link></Button>)}</div></>}
  </main><Footer /></div></QueueProvider>;
};
export default Index;
