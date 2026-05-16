import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CategoriesPage from "./page";

vi.mock("@/components/SiteHeader", () => ({
  default: () => createElement("header", null, "Header"),
}));

vi.mock("@/components/CategoryBrowser", () => ({
  default: () => createElement("div", null, "Category browser"),
}));

describe("CategoriesPage", () => {
  it("renders categories page", () => {
    render(createElement(CategoriesPage));

    expect(screen.getByText("Обери розділ магазину")).toBeInTheDocument();
    expect(screen.getByText("Category browser")).toBeInTheDocument();
  });
});
