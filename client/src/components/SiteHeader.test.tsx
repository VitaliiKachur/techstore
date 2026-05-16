import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SiteHeader from "./SiteHeader";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/auth", () => ({
  clearAuthToken: vi.fn(),
  getAuthToken: vi.fn(() => null),
  loadCurrentUser: vi.fn(),
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders navigation and login action for guests", () => {
    render(<SiteHeader />);

    expect(screen.getByText("TechStore")).toBeInTheDocument();
    expect(screen.getByText("Увійти").closest("a")).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Кошик" })).toHaveAttribute("href", "/cart");
  });
});
