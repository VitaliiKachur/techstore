import "./test/prisma-mock";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("createApp", () => {
  it("responds on root route", async () => {
    const response = await request(createApp()).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "TechStore API is running" });
  });
});
