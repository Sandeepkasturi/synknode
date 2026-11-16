import { describe, expect, test } from "bun:test";
import { HighSpeedUploadQueue } from "./uploadEngine";

describe("parallel upload queue", () => {
  test("limits concurrency to four and reports aggregate byte progress", async () => {
    const files = Array.from({ length: 7 }, (_, index) => ({ name: `file-${index}.txt`, size: 100 }) as File);
    let active = 0;
    let maxActive = 0;
    let finalPercent = 0;
    const queue = new HighSpeedUploadQueue((_items, batch) => {
      finalPercent = batch.aggregatePercent;
    });

    await queue.uploadBatch(files, async (file, _id, onBytes) => {
      active++;
      maxActive = Math.max(maxActive, active);
      onBytes(file.size / 2, 200, 1);
      await new Promise((resolve) => setTimeout(resolve, 5));
      onBytes(file.size, 200, 0);
      active--;
    });

    expect(maxActive).toBe(4);
    expect(finalPercent).toBe(100);
  });
});
