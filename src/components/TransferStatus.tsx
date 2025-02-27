
import React from 'react';
import { 
  CircleCheck,
  CircleX,
  Loader2,
  AlertCircle,
  Clock
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
          icon: <Clock className="h-5 w-5 text-amber-500 animate-pulse" />,
          title: 'Waiting for permission',
          description: `Requesting access from ${remotePeer}...`,
          color: 'bg-amber-100 border-amber-200 text-amber-800'
        };
      case 'granted':
        return {
          icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
          title: 'Permission granted',
          description: 'Starting file transfer...',
          color: 'bg-blue-100 border-blue-200 text-blue-800'
        };
      case 'transferring':
        return {
          icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
          title: 'Receiving files',
          description: `Downloading ${progress}% complete`,
          color: 'bg-blue-100 border-blue-200 text-blue-800'
        };
      case 'completed':
        return {
          icon: <CircleCheck className="h-5 w-5 text-green-500" />,
          title: 'Transfer complete',
          description: 'All files have been downloaded successfully',
          color: 'bg-green-100 border-green-200 text-green-800'
        };
      case 'denied':
        return {
          icon: <CircleX className="h-5 w-5 text-red-500" />,
          title: 'Permission denied',
          description: 'The sender denied your request',
          color: 'bg-red-100 border-red-200 text-red-800'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          title: 'Error occurred',
          description: 'There was a problem with the file transfer',
          color: 'bg-red-100 border-red-200 text-red-800'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          title: 'Unknown status',
          description: 'Status information not available',
          color: 'bg-gray-100 border-gray-200 text-gray-800'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`mt-6 p-4 rounded-lg border ${statusInfo.color} animate-fade-in`}>
      <div className="flex items-center gap-3">
        {statusInfo.icon}
        <div>
          <h3 className="font-medium">{statusInfo.title}</h3>
          <p className="text-sm opacity-90">{statusInfo.description}</p>
        </div>
      </div>
      
      {status === 'transferring' && (
        <div className="mt-3">
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};
