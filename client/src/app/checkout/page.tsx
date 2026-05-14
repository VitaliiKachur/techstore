import CheckoutPageClient from "@/components/CheckoutPageClient";
import SiteHeader from "@/components/SiteHeader";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />
      <CheckoutPageClient />
    </main>
  );
}
