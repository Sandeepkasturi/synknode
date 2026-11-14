import { describe, expect, test } from "bun:test";
import { MAX_SHARED_FILE_BYTES, MAX_SHARED_FILES, MAX_SHARED_TOTAL_BYTES, partitionSharedFiles } from "./shareIntake";

const file = (name: string, size: number) => ({ name, size, type: "application/octet-stream", lastModified: 0 });

describe("Android shared file intake limits", () => {
  test("accepts files up to 50 MB and rejects files above the per-file limit", () => {
    const result = partitionSharedFiles([file("allowed.bin", MAX_SHARED_FILE_BYTES), file("large.bin", MAX_SHARED_FILE_BYTES + 1)]);
    expect(result.accepted.map(item => item.name)).toEqual(["allowed.bin"]);
    expect(result.rejected).toEqual([{ name: "large.bin", reason: "file-too-large" }]);
  });

  test("limits a share to 50 files and a 5 GB total", () => {
    const countResult = partitionSharedFiles(Array.from({ length: MAX_SHARED_FILES + 1 }, (_, index) => file(`file-${index}`, 1)));
    expect(countResult.accepted).toHaveLength(50);
    expect(countResult.rejected.at(0)?.reason).toBe("too-many-files");

    const maximumBatch = partitionSharedFiles(Array.from({ length: MAX_SHARED_FILES }, (_, index) => file(`batch-${index}`, MAX_SHARED_FILE_BYTES)));
    expect(maximumBatch.totalBytes).toBe(MAX_SHARED_FILES * MAX_SHARED_FILE_BYTES);
    expect(maximumBatch.totalBytes).toBe(2_621_440_000);
    expect(maximumBatch.totalBytes).toBeLessThan(MAX_SHARED_TOTAL_BYTES);
  });

  test("rejects zero-byte items while retaining valid files in the same share", () => {
    const result = partitionSharedFiles([file("empty.txt", 0), file("valid.txt", 1)]);
    expect(result.accepted.map(item => item.name)).toEqual(["valid.txt"]);
    expect(result.rejected).toEqual([{ name: "empty.txt", reason: "empty" }]);
  });
});