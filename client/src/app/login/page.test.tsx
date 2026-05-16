import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

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
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/SiteHeader", () => ({
  default: () => <header>Header</header>,
}));

vi.mock("@/lib/auth", () => ({
  loginByEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  registerByEmail: vi.fn(),
}));

describe("LoginPage", () => {
  it("renders login form", async () => {
    render(<LoginPage />);

    expect(await screen.findByRole("heading", { name: "Вхід у профіль" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Пароль")).toBeInTheDocument();
  });
});
