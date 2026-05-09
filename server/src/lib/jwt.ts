import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export type TokenPayload = {
  userId: string;
  role: Role;
};

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (
    typeof decoded !== "object" ||
    typeof decoded.userId !== "string" ||
    (decoded.role !== Role.USER && decoded.role !== Role.ADMIN)
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    userId: decoded.userId,
    role: decoded.role,
  };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}
