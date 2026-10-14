import { supabase } from '@/integrations/supabase/client';
import { deliverAndDelete } from './receiverDownload';
import { getFileSecurityIssue } from '@/utils/fileTransfer.utils';
import { withRetry } from './keepalive';
import type { QueueFile } from '@/types/queue.types';

export async function downloadReceiverFile(file: QueueFile, sender: string) {
  const issue = getFileSecurityIssue(file);
  if (issue) throw new Error(issue);
  await deliverAndDelete(file, sender, {
    fetchBlob: async path => {
      const { data, error } = await withRetry(async () => {
        const result = await supabase.storage.from('pending-files').download(path);
        if (result.error) throw result.error;
        return result;
      });
      if (error) throw error;
      if (!data) throw new Error('File content is unavailable');
      return data;
    },
    saveBlob: (blob, name) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    },
    removeObject: async path => {
      await withRetry(async () => {
        const { error } = await supabase.storage.from('pending-files').remove([path]);
        if (error) throw new Error(`Download started, but file cleanup failed: ${error.message}`);
      });
    },
    deleteRecord: async id => {
      await withRetry(async () => {
        const { error } = await supabase.from('pending_transfers').delete().eq('id', id);
        if (error) throw new Error(`Download started, but record cleanup failed: ${error.message}`);
      });
    },
  });
  void import('./analytics').then(m => m.trackTransferDownloaded({
    sender_name: sender, file_name: file.name, file_size: file.size, file_type: file.type,
  }));
}