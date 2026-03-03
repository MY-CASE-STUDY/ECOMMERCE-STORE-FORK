import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/checkout/create/route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

const { getServerSession } = await import("next-auth");

describe("POST /api/checkout/create", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = new Request("http://localhost/api/checkout/create", {
      method: "POST",
      body: JSON.stringify({ items: [{ productId: "1", quantity: 1, price: 10 }] }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when cart is empty", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "u@test.com" },
    } as any);
    const req = new Request("http://localhost/api/checkout/create", {
      method: "POST",
      body: JSON.stringify({ items: [] }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Cart is empty");
  });

  it("returns 400 when items missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "u@test.com" },
    } as any);
    const req = new Request("http://localhost/api/checkout/create", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Cart is empty");
  });
});
