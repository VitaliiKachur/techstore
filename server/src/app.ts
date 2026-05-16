import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import authRouter from "./routes/auth";
import categoryRouter from "./routes/categories";
import healthRouter from "./routes/health";
import orderRouter from "./routes/orders";
import productRouter from "./routes/products";
import promotionRouter from "./routes/promotions";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/products", productRouter);
  app.use("/api/promotions", promotionRouter);
  app.use("/api/orders", orderRouter);

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "TechStore API is running",
    });
  });

  app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);

    if (err.status === 413) {
      res.status(413).json({ message: "Uploaded image is too large" });
      return;
    }

    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
