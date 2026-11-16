import { describe, expect, test } from "bun:test";
import { LIMITS, validateTransferBatch } from "./transferLimits";

describe("transfer batch limits", () => {
  test("allows a file exactly at the individual cap", () => {
    expect(validateTransferBatch([{ name: "large.bin", size: LIMITS.MAX_FILE_SIZE_BYTES }]).valid).toBe(true);
  });

  test("rejects files over the individual cap and empty files", () => {
    const result = validateTransferBatch([
      { name: "too-large.bin", size: LIMITS.MAX_FILE_SIZE_BYTES + 1 },
      { name: "empty.txt", size: 0 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  test("rejects batches over 5 GB and empty selections", () => {
    expect(validateTransferBatch([{ name: "a", size: LIMITS.MAX_BATCH_SIZE_BYTES + 1 }]).valid).toBe(false);
    expect(validateTransferBatch([]).errors).toEqual(["No files selected."]);
  });
});
