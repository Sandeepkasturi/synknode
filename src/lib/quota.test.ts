import { describe, it, expect } from "vitest";
import { fitsQuota, isTransferExpired, USER_SPACE_QUOTA_BYTES } from "./quota";

describe("user space quota", () => {
  it("allows up to exactly 2 GB and rejects beyond", () => {
    expect(USER_SPACE_QUOTA_BYTES).toBe(2147483648);
    expect(fitsQuota(2147483648 - 10, 10)).toBe(true);
    expect(fitsQuota(2147483648 - 10, 11)).toBe(false);
  });
});

describe("3-day auto deletion", () => {
  const upload = new Date("2026-10-01T00:00:00Z");
  it("keeps files at 72 hours", () => {
    expect(isTransferExpired(upload, new Date("2026-10-04T00:00:00Z"))).toBe(false);
  });
  it("expires files after 72 hours", () => {
    expect(isTransferExpired(upload, new Date("2026-10-04T00:00:01Z"))).toBe(true);
  });
});
