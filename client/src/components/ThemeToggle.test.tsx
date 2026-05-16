import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = "light";
  });

  it("toggles theme and persists preference", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    expect(screen.getByText("Світла")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Перемкнути тему" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByText("Темна")).toBeInTheDocument();
  });
});
