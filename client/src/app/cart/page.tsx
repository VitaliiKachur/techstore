import CartPageClient from "@/components/CartPageClient";
import SiteHeader from "@/components/SiteHeader";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />
      <CartPageClient />
    </main>
  );
}
