import { describe, it, expect } from "vitest";
import { formatPrice, calculateShipping, cn } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats zero as GBP", () => {
    expect(formatPrice(0)).toBe("£0.00");
  });

  it("formats positive number as GBP", () => {
    expect(formatPrice(24.99)).toBe("£24.99");
  });

  it("formats large number with commas", () => {
    expect(formatPrice(1234.56)).toMatch(/£1,234\.56/);
  });
});

describe("calculateShipping", () => {
  it("returns 0 when subtotal >= 50", () => {
    expect(calculateShipping(50)).toBe(0);
    expect(calculateShipping(100)).toBe(0);
  });

  it("returns 4.99 when subtotal < 50", () => {
    expect(calculateShipping(0)).toBe(4.99);
    expect(calculateShipping(49.99)).toBe(4.99);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toContain("visible");
  });
});
