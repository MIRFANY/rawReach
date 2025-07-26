// components/marketplace/MarketplaceGrid.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import type { Listing } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MarketplaceGrid() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Listing["type"]>("all");
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch once
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      else setListings(data as Listing[]);
      setLoading(false);
    })();
    const saved = localStorage.getItem("smartmandi_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // helpers
  const addToCart = (item: Listing) => {
    const exists = cart.find((c) => c.id === item.id);
    const newCart = exists
      ? cart.map((c) =>
          c.id === item.id ? { ...c, cartQuantity: c.cartQuantity + 1 } : c
        )
      : [...cart, { ...item, cartQuantity: 1 }];
    setCart(newCart);
    localStorage.setItem("smartmandi_cart", JSON.stringify(newCart));
  };

  const visible = listings.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = filter === "all" || l.type === filter;
    return matchSearch && matchType;
  });

  if (loading) return <p className="text-center p-8">Loading…</p>;

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">SmartMandi Marketplace</h1>
        <div className="flex gap-4 mb-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="flex-1"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Sources</option>
            <option value="sabzimandi">Sabzimandi</option>
            <option value="firm">Firms</option>
            <option value="vendor">Vendors</option>
          </select>
        </div>
        <div className="bg-blue-50 p-4 rounded mb-6">
          Cart items: {cart.reduce((n, i) => n + i.cartQuantity, 0)}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-gray-500">No matches.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((l) => (
            <Card key={l.id} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{l.name}</CardTitle>
                <div className="flex justify-between items-center text-sm">
                  <Badge
                    variant={l.type === "sabzimandi" ? "default" : "secondary"}
                  >
                    {l.type}
                  </Badge>
                  <span className="font-semibold text-green-600">
                    ₹{l.price}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm line-clamp-3">{l.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Qty: {l.quantity}
                  </span>
                  <Button size="sm" onClick={() => addToCart(l)}>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
