import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminPage from "./page";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/SiteHeader", () => ({
  default: () => <header>Header</header>,
}));

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(() => null),
  loadCurrentUser: vi.fn(),
}));

describe("AdminPage", () => {
  it("shows sign-in prompt for guests", async () => {
    render(<AdminPage />);

    expect(await screen.findByText(/увійди в акаунт адміністратора/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Увійти" })).toHaveAttribute("href", "/login");
  });
});
