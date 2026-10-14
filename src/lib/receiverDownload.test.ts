import { describe, expect, test } from 'bun:test';
import { deliverAndDelete, type DownloadDependencies } from './receiverDownload';

const file = { name: 'report.txt', type: 'text/plain', size: 4, storagePath: 'folder/report.txt', dbId: 'transfer-id' };
const fixture = () => {
  const calls: string[] = [];
  const deps: DownloadDependencies = {
    fetchBlob: async path => { calls.push(`fetch:${path}`); return new Blob(['test']); },
    saveBlob: (blob, name) => { expect(blob.size).toBe(4); calls.push(`save:${name}`); },
    removeObject: async path => { calls.push(`remove:${path}`); },
    deleteRecord: async id => { calls.push(`delete:${id}`); },
  };
  return { calls, deps };
};

describe('receiver permanent download cleanup', () => {
  test('deletes the storage object and database record after delivery', async () => {
    const { calls, deps } = fixture();
    await deliverAndDelete(file, 'Sender', deps);
    expect(calls).toEqual(['fetch:folder/report.txt', 'save:Sender_report.txt', 'remove:folder/report.txt', 'delete:transfer-id']);
  });
  test('failed retrieval never deletes the file', async () => {
    const { calls, deps } = fixture();
    deps.fetchBlob = async () => { throw new Error('Network failure'); };
    await expect(deliverAndDelete(file, 'Sender', deps)).rejects.toThrow('Network failure');
    expect(calls).toEqual([]);
  });
  test('failed storage deletion retains the database record for retry', async () => {
    const { calls, deps } = fixture();
    deps.removeObject = async () => { throw new Error('Cleanup failure'); };
    await expect(deliverAndDelete(file, 'Sender', deps)).rejects.toThrow('Cleanup failure');
    expect(calls).toEqual(['fetch:folder/report.txt', 'save:Sender_report.txt']);
  });
});