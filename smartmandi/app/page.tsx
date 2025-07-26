import { MarketplaceGrid } from "@/components/marketplace/MarketPlaceGrid";
import { SpecialDealsSection } from "@/components/special-deals/SpecialDealsSection";

export default function MarketHome() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-12">
      <MarketplaceGrid />
      <SpecialDealsSection />
    </main>
  );
}
