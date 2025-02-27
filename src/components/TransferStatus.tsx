
import React from 'react';
import { 
  CircleCheck,
  CircleX,
  Loader2,
  AlertCircle,
  Clock,
  Wifi,
  FileDown,
  FileCheck
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TransferStatusProps {
  status: 'pending' | 'granted' | 'denied' | 'transferring' | 'completed' | 'error';
  progress: number;
  remotePeer: string;
}

export const TransferStatus: React.FC<TransferStatusProps> = ({
  status,
  progress,
  remotePeer
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-brand-amber animate-pulse" />,
          title: 'Waiting for permission',
          description: `Requesting access from ${remotePeer}...`,
          color: 'bg-amber-50 border-amber-200 text-amber-800',
          progressColor: 'bg-brand-amber',
          iconContainer: 'bg-amber-100'
        };
      case 'granted':
        return {
          icon: <Wifi className="h-5 w-5 text-brand-blue animate-pulse" />,
          title: 'Permission granted',
          description: 'Connection established! Starting file transfer...',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          progressColor: 'bg-brand-blue',
          iconContainer: 'bg-blue-100'
        };
      case 'transferring':
        return {
          icon: <FileDown className="h-5 w-5 text-brand-indigo" />,
          title: 'Receiving files',
          description: `Downloading in progress... ${progress}% complete`,
          color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          progressColor: 'bg-brand-indigo',
          iconContainer: 'bg-indigo-100'
        };
      case 'completed':
        return {
          icon: <FileCheck className="h-5 w-5 text-brand-green" />,
          title: 'Transfer complete',
          description: 'All files have been downloaded successfully!',
          color: 'bg-green-50 border-green-200 text-green-800',
          progressColor: 'bg-brand-green',
          iconContainer: 'bg-green-100'
        };
      case 'denied':
        return {
          icon: <CircleX className="h-5 w-5 text-brand-pink" />,
          title: 'Permission denied',
          description: 'The sender denied your file request',
          color: 'bg-pink-50 border-pink-200 text-pink-800',
          progressColor: 'bg-brand-pink',
          iconContainer: 'bg-pink-100'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-destructive" />,
          title: 'Error occurred',
          description: 'There was a problem with the file transfer',
          color: 'bg-red-50 border-red-200 text-red-800',
          progressColor: 'bg-destructive',
          iconContainer: 'bg-red-100'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          title: 'Unknown status',
          description: 'Status information not available',
          color: 'bg-gray-100 border-gray-200 text-gray-800',
          progressColor: 'bg-gray-400',
          iconContainer: 'bg-gray-100'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`mt-6 p-5 rounded-lg glass-card shadow-md animate-fade-in ${statusInfo.color}`}>
      <div className="flex items-start gap-4">
        <div className={`${statusInfo.iconContainer} rounded-full p-3 flex-shrink-0`}>
          {status === 'transferring' ? (
            <Loader2 className="h-5 w-5 text-brand-indigo animate-spin" />
          ) : (
            statusInfo.icon
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{statusInfo.title}</h3>
          <p className="text-sm opacity-90 mt-1">{statusInfo.description}</p>
          
          {status === 'transferring' && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-indigo-100" 
                indicatorClassName={statusInfo.progressColor}
              />
            </div>
          )}
          
          {status === 'completed' && (
            <div className="mt-3 flex justify-center">
              <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium inline-flex items-center gap-1">
                <CircleCheck size={12} />
                Files saved to downloads
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
