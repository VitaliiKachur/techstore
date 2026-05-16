import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CartPage from "./page";

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
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/SiteHeader", () => ({
  default: () => <header>Header</header>,
}));

vi.mock("@/components/CartPageClient", () => ({
  default: () => <div>Cart content</div>,
}));

describe("CartPage", () => {
  it("renders cart layout", () => {
    render(<CartPage />);

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Cart content")).toBeInTheDocument();
  });
});
