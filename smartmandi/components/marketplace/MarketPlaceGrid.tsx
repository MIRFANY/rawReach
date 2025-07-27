// components/marketplace/MarketplaceGrid.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import type { Listing } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { INDIA_STATES, INDIA_DISTRICTS } from "@/public/data/india";

type MandiRow = {
  id: string;
  commodity: string;
  variety: string | null;
  market: string | null;
  state: string;
  district: string;
  modal_price: number | null;
  arrival_date: string;
};

export function MarketplaceGrid() {
  const router = useRouter();

  // ─── State ─────────────────────────────────────────────────────────
  const [listings, setListings] = useState<Listing[]>([]);
  const [mandiRows, setMandiRows] = useState<MandiRow[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingMandi, setLoadingMandi] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Listing["type"]>("all");
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  // ─── Initial Listings + Cart ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error("Listings fetch error:", error);
      else setListings(data as Listing[]);
      setLoadingListings(false);
    })();

    const saved = localStorage.getItem("smartmandi_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // ─── Fetch Sabzi Mandi Data ─────────────────────────────────────────
  useEffect(() => {
    if (!stateFilter) return setMandiRows([]);
    if (typeFilter !== "sabzimandi" && typeFilter !== "all")
      return setMandiRows([]);

    (async () => {
      setLoadingMandi(true);
      // trigger the bulk-import
      try {
        await fetch("/api/admin/bulk-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: `https://www.kisandeals.com/mandiprices/ALL/ALL/${encodeURIComponent(
              stateFilter
            )}`,
          }),
        });
      } catch (err) {
        console.error("Bulk-import error:", err);
      }

      // then read from supabase
      const { data, error } = await supabase
        .from("mandi_prices")
        .select("*")
        .eq("state", stateFilter)
        .order("arrival_date", { ascending: false })
        .limit(100);

      if (error) console.error("Mandi fetch error:", error);
      else setMandiRows(data as MandiRow[]);
      setLoadingMandi(false);
    })();
  }, [stateFilter, typeFilter]);

  // ─── Cart Helpers ───────────────────────────────────────────────────
  const addToCart = (item: any) => {
    const exists = cart.find((c) => c.id === item.id);
    const newCart = exists
      ? cart.map((c) =>
          c.id === item.id ? { ...c, cartQuantity: c.cartQuantity + 1 } : c
        )
      : [...cart, { ...item, cartQuantity: 1 }];
    setCart(newCart);
    localStorage.setItem("smartmandi_cart", JSON.stringify(newCart));
  };

  // ─── Merge & Filter ─────────────────────────────────────────────────
  const convertedMandi: Listing[] = mandiRows.map((m) => ({
    id: m.id,
    name: m.variety ? `${m.commodity} - ${m.variety}` : m.commodity,
    type: "sabzimandi",
    price: m.modal_price ?? 0,
    quantity: 1,
    owner_name: null,
    description: m.market ? `Market: ${m.market}` : "",
    photo_url: null,
    contact_info: null,
    created_at: m.arrival_date,
    state: m.state,
    district: m.district,
  }));

  const allItems = [...listings, ...convertedMandi];
  const visible = allItems.filter((l) => {
    const matchesText =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || l.type === typeFilter;
    const matchesState = !stateFilter || l.state === stateFilter;
    const matchesDistrict = !districtFilter || l.district === districtFilter;
    return matchesText && matchesType && matchesState && matchesDistrict;
  });

  // ─── Loading UI ─────────────────────────────────────────────────────
  if (loadingListings) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <section className="relative">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">SmartMandi Marketplace</h1>
          {loadingMandi && (
            <Badge variant="outline" className="flex items-center">
              Updating Mandi
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </Badge>
          )}
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="flex-1 px-3 py-2 border rounded-md"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Sources</option>
            <option value="sabzimandi">Sabzimandi</option>
            <option value="firm">Firms</option>
          </select>

          <Select
            onValueChange={(val) => {
              setStateFilter(val);
              setDistrictFilter("");
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>States</SelectLabel>
                {INDIA_STATES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(val) => setDistrictFilter(val)}
            disabled={!stateFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Districts</SelectLabel>
                {(INDIA_DISTRICTS[stateFilter] || []).map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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

      {/* Floating Cart */}
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
          <h3 className="font-bold mb-2">Your Cart</h3>
          {cart.length === 0 ? (
            <p className="text-sm text-gray-500">Cart is empty.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-auto">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.cartQuantity}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" onClick={() => addToCart(item)}>
                      +
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        const updated = cart
                          .map((c) =>
                            c.id === item.id
                              ? {
                                  ...c,
                                  cartQuantity: c.cartQuantity - 1,
                                }
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
