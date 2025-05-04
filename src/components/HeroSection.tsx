
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileImage, Share, Presentation } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center mb-16">
      <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
        Share files and present content <span className="text-indigo-600">effortlessly</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        Connect devices instantly and transfer files with complete privacy and speed.
        No accounts, no limits, no tracking.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/airshare">
          <Button size="lg" className="text-lg px-8 py-6 flex gap-2 items-center">
            <FileImage className="h-5 w-5" />
            AirShare Files
          </Button>
        </Link>
        
        <Link to="/sharomatic">
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 flex gap-2 items-center">
            <Presentation className="h-5 w-5" />
            Sharomatic Presenter
          </Button>
        </Link>
      </div>
    </div>
  );
};
