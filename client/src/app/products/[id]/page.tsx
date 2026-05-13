import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import ProductImage from "@/components/ProductImage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ProductDetails = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: {
    id: string;
    name: string;
  };
};

type ProductResponse = {
  product: ProductDetails;
};

type ProductPageParams = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageParams) {
  const resolvedParams = await params;
  const product = await loadProduct(resolvedParams.id);

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <Link
          className="text-sm font-bold text-[var(--muted)] underline decoration-[var(--accent)] decoration-2 underline-offset-4"
          href="/products"
        >
          Назад до каталогу
        </Link>

        <article className="mt-4 grid gap-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--page)] p-4">
            <ProductImage alt={product.title} className="min-h-[300px]" src={product.image} />
          </div>

          <div>
            <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
              {product.category.name}
            </p>
            <h1 className="mt-2 text-3xl font-black">{product.title}</h1>
            <p className="mt-4 leading-7 text-[var(--muted)]">{product.description}</p>
            <p className="mt-6 text-sm font-bold text-[var(--muted)]">
              {product.stock > 0 ? `В наявності: ${product.stock}` : "Немає в наявності"}
            </p>
            <p className="mt-2 text-4xl font-black">{formatPrice(product.price)}</p>
          </div>
        </article>
      </section>
    </main>
  );
}

async function loadProduct(productId: string): Promise<ProductDetails> {
  const response = await fetch(`${API_URL}/api/products/${productId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Не вдалося завантажити товар.");
  }

  const data = (await response.json()) as ProductResponse;
  return data.product;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(price);
}
