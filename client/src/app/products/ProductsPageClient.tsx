"use client";

import { useSearchParams } from "next/navigation";
import ProductsCatalog from "@/components/ProductsCatalog";

export default function ProductsPageClient() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") ?? "";
  const categoryName = searchParams.get("category") ?? "";
  const promotionOnly = searchParams.get("promotion") === "active";
  const search = searchParams.get("search") ?? "";

  return (
    <ProductsCatalog
      initialCategoryId={categoryId}
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
