import { MarketplaceGrid } from "@/components/marketplace/MarketPlaceGrid";
import { SpecialDealsSection } from "@/components/special-deals/SpecialDealsSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function MarketHome() {
  return (
    <Tabs defaultValue="market" className="max-w-6xl mx-auto p-6 space-y-8">
      <TabsList>
        <TabsTrigger value="market"> Marketplace</TabsTrigger>
        <TabsTrigger value="deals"> Special Deals</TabsTrigger>
      </TabsList>
      <TabsContent value="market">
        <MarketplaceGrid />
      </TabsContent>
      <TabsContent value="deals">
        <SpecialDealsSection />
      </TabsContent>
    </Tabs>
  );
}
