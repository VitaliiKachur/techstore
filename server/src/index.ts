import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import authRouter from "./routes/auth";
import categoryRouter from "./routes/categories";
import healthRouter from "./routes/health";
import orderRouter from "./routes/orders";
import productRouter from "./routes/products";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "TechStore API is running",
  });
});

app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err.status === 413) {
    res.status(413).json({ message: "Uploaded image is too large" });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
