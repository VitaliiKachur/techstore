import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockCatalogFetch } from "@/test/fetch-mocks";
import CategoryBrowser from "./CategoryBrowser";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("CategoryBrowser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders loaded categories", async () => {
    mockCatalogFetch();
    render(<CategoryBrowser />);

    expect(await screen.findByText("Смартфони")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Смартфони/i })).toHaveAttribute("href", expect.stringContaining("cat-1"));
  });
});
