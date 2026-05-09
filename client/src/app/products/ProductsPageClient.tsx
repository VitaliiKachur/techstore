"use client";

import { useSearchParams } from "next/navigation";
import ProductsCatalog from "@/components/ProductsCatalog";

export default function ProductsPageClient() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") ?? "";
  const categoryName = searchParams.get("category") ?? "";
  const search = searchParams.get("search") ?? "";

  return (
    <ProductsCatalog
      initialCategoryId={categoryId}
      initialSearch={search}
      title={categoryName ? `Товари категорії: ${categoryName}` : "Усі товари"}
    />
  );
}
