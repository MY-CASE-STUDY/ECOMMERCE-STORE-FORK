import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/admin/orders/route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findMany: vi.fn() },
  },
}));

const { getServerSession } = await import("next-auth");
const { prisma } = await import("@/lib/prisma");

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
    vi.mocked(prisma.order.findMany).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 401 when user is not admin", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { role: "customer" },
    } as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns all orders when admin", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { role: "admin" },
    } as any);
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { id: "ord-1", orderNumber: "GC-1", user: { name: "U1", email: "u1@t.com" } } as any,
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.orders).toHaveLength(1);
  });
});
