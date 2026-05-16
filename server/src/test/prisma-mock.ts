import { vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  product: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  promotion: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  order: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

export { prismaMock };
