import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/discount/validate/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    discountCode: {
      findUnique: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");

describe("POST /api/discount/validate", () => {
  beforeEach(() => {
    vi.mocked(prisma.discountCode.findUnique).mockReset();
  });

  it("returns error when code is missing", async () => {
    const req = new Request("http://localhost/api/discount/validate", {
      method: "POST",
      body: JSON.stringify({ subtotal: 100 }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const data = await res.json();
    expect(data.valid).toBe(false);
    expect(data.error).toContain("Code");
  });

  it("returns invalid when code not found", async () => {
    vi.mocked(prisma.discountCode.findUnique).mockResolvedValue(null);
    const req = new Request("http://localhost/api/discount/validate", {
      method: "POST",
      body: JSON.stringify({ code: "INVALID", subtotal: 100 }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const data = await res.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe("Invalid code");
  });

  it("returns valid and discount for valid percentage code", async () => {
    vi.mocked(prisma.discountCode.findUnique).mockResolvedValue({
      id: "1",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minPurchase: null,
      maxDiscount: null,
      usageLimit: null,
      usedCount: 0,
      validFrom: new Date(0),
      validUntil: new Date(Date.now() + 86400000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const req = new Request("http://localhost/api/discount/validate", {
      method: "POST",
      body: JSON.stringify({ code: "welcome10", subtotal: 100 }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const data = await res.json();
    expect(data.valid).toBe(true);
    expect(data.discount).toBe(10);
  });
});
