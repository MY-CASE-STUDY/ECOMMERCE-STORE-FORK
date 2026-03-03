import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  },
}));

const { prisma } = await import("@/lib/prisma");

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(prisma.user.create).mockReset();
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "pass123" }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("All fields are required");
  });

  it("returns 400 when email is missing", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "User", password: "pass123" }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("All fields are required");
  });

  it("returns 400 when user already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      email: "existing@test.com",
      name: "Existing",
      password: "hash",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "New",
        email: "existing@test.com",
        password: "pass123",
      }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("User already exists");
  });

  it("returns 201 and creates user when valid", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-1",
      email: "new@test.com",
      name: "New User",
      password: "hashed_pass",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "New User",
        email: "new@test.com",
        password: "securepass",
      }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toBe("User created successfully");
    expect(data.userId).toBe("user-1");
  });
});
