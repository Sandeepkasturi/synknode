import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { QueueProvider } from '@/context/QueueContext';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SynkNodeShowcase } from '@/components/SynkNodeShowcase';

const Index: React.FC = () => {
  const [params] = useSearchParams();
  const requestedView = params.get('view') || 'transfer';
  const view = ['transfer', 'activity', 'analytics', 'settings'].includes(requestedView) ? requestedView : 'transfer';

  return <QueueProvider>
    <div className="app-shell showcase-shell">
      <Header />
      <SynkNodeShowcase activeView={view} />
      <Footer />
    </div>
  </QueueProvider>;
};

export default Index;
