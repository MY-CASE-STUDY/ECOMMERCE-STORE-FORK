import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/products/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");

function nextRequest(url: string): import("next/server").NextRequest {
  const req = new Request(url) as import("next/server").NextRequest;
  (req as any).nextUrl = new URL(url);
  return req;
}

describe("GET /api/products", () => {
  beforeEach(() => {
    vi.mocked(prisma.product.findMany).mockReset();
  });

  it("returns products array when products exist", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: "1",
        name: "Test Product",
        description: "Desc",
        price: 29.99,
        compareAtPrice: null,
        images: "[]",
        category: "Shirts",
        brand: null,
        sku: "SKU-1",
        inventory: 10,
        isActive: true,
        tags: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const res = await GET(nextRequest("http://localhost/api/products"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.products).toHaveLength(1);
    expect(data.products[0].name).toBe("Test Product");
    expect(Array.isArray(data.products[0].images)).toBe(true);
  });

  it("returns empty array when no products", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    const res = await GET(nextRequest("http://localhost/api/products"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.products).toHaveLength(0);
  });

  it("applies category filter when provided", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    await GET(nextRequest("http://localhost/api/products?category=Shirts"));
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { contains: "Shirts", mode: "insensitive" },
        }),
      })
    );
  });

  it("returns 500 on database error", async () => {
    vi.mocked(prisma.product.findMany).mockRejectedValue(new Error("DB error"));
    const res = await GET(nextRequest("http://localhost/api/products"));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Failed to fetch products");
  });
});
