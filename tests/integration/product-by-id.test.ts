import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/products/[id]/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");

describe("GET /api/products/[id]", () => {
  beforeEach(() => {
    vi.mocked(prisma.product.findUnique).mockReset();
  });

  it("returns product when found", async () => {
    const product = {
      id: "prod-1",
      name: "Test Product",
      description: "Description",
      price: 49.99,
      compareAtPrice: null,
      images: "[]",
      category: "Shirts",
      brand: null,
      sku: "SKU-1",
      inventory: 5,
      isActive: true,
      tags: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      reviews: [],
    };
    vi.mocked(prisma.product.findUnique).mockResolvedValue(product);
    const req = new Request("http://localhost/api/products/prod-1");
    const res = await GET(req as unknown as import("next/server").NextRequest, {
      params: Promise.resolve({ id: "prod-1" }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.product.name).toBe("Test Product");
    expect(data.product.averageRating).toBeDefined();
    expect(data.product.reviewCount).toBe(0);
  });

  it("returns 404 when product not found", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
    const req = new Request("http://localhost/api/products/bad-id");
    const res = await GET(req as unknown as import("next/server").NextRequest, {
      params: Promise.resolve({ id: "bad-id" }),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Product not found");
  });

  it("returns 500 on database error", async () => {
    vi.mocked(prisma.product.findUnique).mockRejectedValue(new Error("DB error"));
    const req = new Request("http://localhost/api/products/prod-1");
    const res = await GET(req as unknown as import("next/server").NextRequest, {
      params: Promise.resolve({ id: "prod-1" }),
    });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Failed to fetch product");
  });
});
