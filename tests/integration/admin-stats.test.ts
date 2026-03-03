import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/admin/stats/route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { count: vi.fn() },
    order: { count: vi.fn(), findMany: vi.fn() },
    user: { count: vi.fn() },
  },
}));

const { getServerSession } = await import("next-auth");
const { prisma } = await import("@/lib/prisma");

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
    vi.mocked(prisma.product.count).mockReset();
    vi.mocked(prisma.order.count).mockReset();
    vi.mocked(prisma.order.findMany).mockReset();
    vi.mocked(prisma.user.count).mockReset();
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

  it("returns stats when admin", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { role: "admin" },
    } as any);
    vi.mocked(prisma.product.count).mockResolvedValue(10);
    vi.mocked(prisma.order.count).mockResolvedValue(5);
    vi.mocked(prisma.user.count).mockResolvedValue(3);
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { total: 50 },
      { total: 30 },
    ] as any);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalProducts).toBe(10);
    expect(data.totalOrders).toBe(5);
    expect(data.totalUsers).toBe(3);
    expect(data.totalRevenue).toBe(80);
  });
});
