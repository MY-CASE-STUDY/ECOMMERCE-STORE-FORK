import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/orders/route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    order: { findMany: vi.fn() },
  },
}));

const { getServerSession } = await import("next-auth");
const { prisma } = await import("@/lib/prisma");

describe("GET /api/orders", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(prisma.order.findMany).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 401 when session has no email", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: {} } as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 404 when user not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "u@test.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("User not found");
  });

  it("returns orders for authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "u@test.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "u@test.com",
    } as any);
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      {
        id: "ord-1",
        orderNumber: "GC-1",
        total: 99.99,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.orders).toHaveLength(1);
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } })
    );
  });
});
