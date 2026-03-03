import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/admin/products/route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: vi.fn() },
  },
}));

const { getServerSession } = await import("next-auth");
const { prisma } = await import("@/lib/prisma");

describe("GET /api/admin/products", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
    vi.mocked(prisma.product.findMany).mockReset();
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
      user: { email: "u@test.com", role: "customer" },
    } as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns products when admin", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: "1",
        name: "Admin Product",
        images: "[]",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.products).toHaveLength(1);
    expect(data.products[0].name).toBe("Admin Product");
  });
});
