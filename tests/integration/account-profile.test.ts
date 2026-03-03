import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "@/app/api/account/profile/route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    address: { update: vi.fn(), create: vi.fn() },
  },
}));

const { getServerSession } = await import("next-auth");
const { prisma } = await import("@/lib/prisma");

describe("GET /api/account/profile", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
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

  it("returns profile when authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "u@test.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      name: "User",
      nickname: null,
      email: "u@test.com",
      phone: null,
      location: null,
      preferences: null,
      favoriteStyles: null,
      addresses: [],
    } as any);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("User");
    expect(data.email).toBe("u@test.com");
  });
});

describe("PUT /api/account/profile", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(prisma.user.update).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = new Request("http://localhost/api/account/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "New" }),
    });
    const res = await PUT(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns 200 and updates profile when authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "u@test.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      name: "User",
      addresses: [],
    } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);
    const req = new Request("http://localhost/api/account/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated Name" }),
    });
    const res = await PUT(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Profile updated successfully");
  });
});
