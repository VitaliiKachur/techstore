import { OrderStatus, Prisma, Role } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { calculatePromotionDiscount, getActivePromotion } from "../lib/promotions";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res, next): Promise<void> => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const status = parseOrderStatus(req.query.status);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const where: Prisma.OrderWhereInput =
      authReq.user.role === Role.ADMIN
        ? {
            ...(status ? { status } : {}),
            ...(search
              ? {
                  OR: [
                    { id: { contains: search, mode: "insensitive" } },
                    { user: { name: { contains: search, mode: "insensitive" } } },
                    { user: { email: { contains: search, mode: "insensitive" } } },
                    {
                      items: {
                        some: {
                          product: {
                            title: { contains: search, mode: "insensitive" },
                          },
                        },
                      },
                    },
                  ],
                }
              : {}),
          }
        : { userId: authReq.user.userId };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next): Promise<void> => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;

    if (authReq.user.role !== Role.ADMIN) {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    const orderId = getParam(req.params.id);
    const status = parseOrderStatus((req.body as { status?: unknown }).status);

    if (!orderId) {
      res.status(400).json({ message: "Order id is required" });
      return;
    }

    if (!status) {
      res.status(400).json({ message: "Valid order status is required" });
      return;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: orderInclude,
    });

    res.json({ order });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    next(error);
  }
});

router.get("/:id", async (req, res, next): Promise<void> => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const orderId = getParam(req.params.id);

    if (!orderId) {
      res.status(400).json({ message: "Order id is required" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (authReq.user.role !== Role.ADMIN && order.userId !== authReq.user.userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next): Promise<void> => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const { items } = req.body as {
      items?: Array<{ productId?: string; quantity?: number }>;
    };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "Order must contain at least one item" });
      return;
    }

    const normalizedItems = items.map((item) => ({
      productId: String(item.productId ?? ""),
      quantity: Number(item.quantity),
    }));

    const invalidItem = normalizedItems.find(
      (item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0
    );

    if (invalidItem) {
      res.status(400).json({ message: "Each order item needs productId and positive quantity" });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: normalizedItems.map((item) => item.productId) } },
      });

      if (products.length !== normalizedItems.length) {
        throw new OrderValidationError("One or more products were not found");
      }

      let totalPrice = 0;

      for (const item of normalizedItems) {
        const product = products.find((candidate) => candidate.id === item.productId);

        if (!product) {
          throw new OrderValidationError("One or more products were not found");
        }

        if (product.stock < item.quantity) {
          throw new OrderValidationError(`${product.title} is out of stock`);
        }

        totalPrice += product.price * item.quantity;
      }

      const activePromotion = await getActivePromotion(tx);
      const discount = calculatePromotionDiscount(
        activePromotion,
        normalizedItems.map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId);

          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product?.price ?? 0,
          };
        })
      );
      totalPrice = Math.max(0, totalPrice - discount);

      const createdOrder = await tx.order.create({
        data: {
          userId: authReq.user.userId,
          totalPrice,
          items: {
            create: normalizedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: orderInclude,
      });

      for (const item of normalizedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return createdOrder;
    });

    res.status(201).json({ order });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

class OrderValidationError extends Error {}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseOrderStatus(value: unknown): OrderStatus | undefined {
  return typeof value === "string" && isOrderStatus(value) ? value : undefined;
}

function isOrderStatus(value: string): value is OrderStatus {
  return (Object.values(OrderStatus) as string[]).includes(value);
}

const orderInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.OrderInclude;

export default router;
