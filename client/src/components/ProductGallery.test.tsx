import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ProductGallery from "./ProductGallery";

describe("ProductGallery", () => {
  it("opens and closes lightbox", async () => {
    const user = userEvent.setup();
    render(
      <ProductGallery
        galleryImages={["/gallery-1.png"]}
        mainImage="/main.png"
        title="Phone"
      />
    );

    await user.click(screen.getByRole("button", { name: "Відкрити фото Phone" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Закрити" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
