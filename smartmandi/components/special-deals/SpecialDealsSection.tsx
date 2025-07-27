// components/marketplace/SpecialDealsSection.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ShoppingCart } from "lucide-react";
import { INDIA_DISTRICTS, INDIA_STATES } from "@/public/data/india";

interface SpecialDeal {
  id: string;
  title: string;
  description: string;
  posted_by: string;
  posted_by_type: "vendor" | "firm";
  status: "active" | "expired";
  created_at: string;
  State: string;
  District: string;
}

export function SpecialDealsSection() {
  const router = useRouter();
  const [deals, setDeals] = useState<SpecialDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  useEffect(() => {
    fetchSpecialDeals();
    const saved = localStorage.getItem("smartmandi_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const fetchSpecialDeals = async () => {
    const { data, error } = await supabase
      .from("special_deals")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setDeals(data as SpecialDeal[]);
    setLoading(false);
  };

  const addDealToCart = (deal: SpecialDeal) => {
    const exists = cart.find((c) => c.id === deal.id);
    const newCart = exists
      ? cart.map((c) =>
          c.id === deal.id ? { ...c, cartQuantity: c.cartQuantity + 1 } : c
        )
      : [
          ...cart,
          {
            ...deal,
            name: deal.title,
            type: "special_deal",
            cartQuantity: 1,
          },
        ];
    setCart(newCart);
    localStorage.setItem("smartmandi_cart", JSON.stringify(newCart));
  };

  const filtered = deals.filter(
    (d) =>
      (!stateFilter || d.State === stateFilter) &&
      (!districtFilter || d.District === districtFilter)
  );

  if (loading) return <p className="text-center p-8">Loading…</p>;

  return (
    <section className="relative mt-12">
      <h2 className="text-2xl font-bold mb-4">Special Deals & Offers</h2>

      {/* filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setDistrictFilter("");
          }}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All States</option>
          {INDIA_STATES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          disabled={!stateFilter}
          className="px-3 py-2 border rounded-md disabled:opacity-50"
        >
          <option value="">All Districts</option>
          {(INDIA_DISTRICTS[stateFilter] || []).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* deals grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">No deals found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition">
              <CardHeader className="flex justify-between items-start">
                <CardTitle>{deal.title}</CardTitle>
                <Badge variant="outline">
                  {deal.posted_by_type === "vendor" ? "Vendor" : "Firm"}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm">{deal.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(deal.created_at).toLocaleDateString()}
                  </span>
                  <Button size="sm" onClick={() => addDealToCart(deal)}>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Cart (same as above) */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.reduce((n, i) => n + i.cartQuantity, 0)}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <h3 className="font-bold">Your Cart</h3>
          {cart.length === 0 ? (
            <p className="text-sm text-gray-500">Cart is empty.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-auto">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs">Qty: {item.cartQuantity}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" onClick={() => addDealToCart(item)}>
                      +
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        const updated = cart
                          .map((c) =>
                            c.id === item.id
                              ? { ...c, cartQuantity: c.cartQuantity - 1 }
                              : c
                          )
                          .filter((c) => c.cartQuantity > 0);
                        setCart(updated);
                        localStorage.setItem(
                          "smartmandi_cart",
                          JSON.stringify(updated)
                        );
                      }}
                    >
                      –
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button className="mt-4 w-full" onClick={() => router.push("/cart")}>
            Buy Now
          </Button>
        </PopoverContent>
      </Popover>
    </section>
  );
}
