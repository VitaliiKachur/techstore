"use client";

import { useSearchParams } from "next/navigation";
import ProductsCatalog from "@/components/ProductsCatalog";

export default function ProductsPageClient() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") ?? "";
  const categoryName = searchParams.get("category") ?? "";
  const promotionOnly = searchParams.get("promotion") === "active";
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const focusProductId = searchParams.get("focusProduct") ?? "";

  return (
    <ProductsCatalog
      initialCategoryId={categoryId}
      initialFocusProductId={focusProductId}
      initialPage={Number.isInteger(page) && page > 0 ? page : 1}
      initialPromotionOnly={promotionOnly}
      initialSearch={search}
      title={
        promotionOnly
          ? "Акційні товари"
          : categoryName
            ? `Товари категорії: ${categoryName}`
            : "Усі товари"
      }
    />
  );
}
