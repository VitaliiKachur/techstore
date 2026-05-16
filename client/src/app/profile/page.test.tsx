import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProfilePage from "./page";

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

vi.mock("@/lib/auth", () => ({
  clearAuthToken: vi.fn(),
  getAuthToken: vi.fn(() => null),
  loadCurrentUser: vi.fn(),
  updateCurrentUser: vi.fn(),
}));

describe("ProfilePage", () => {
  it("asks guest to sign in", async () => {
    render(<ProfilePage />);

    expect(await screen.findByText(/сесію не знайдено/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Перейти до входу" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
