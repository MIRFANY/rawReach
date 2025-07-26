"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client"; // Assuming you exported supabase instance
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SpecialDeal {
  id: string;
  title: string;
  description: string;
  posted_by: string;
  posted_by_type: "vendor" | "firm";
  status: "active" | "expired";
  created_at: string;
}

export function SpecialDealsSection() {
  const [deals, setDeals] = useState<SpecialDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetchSpecialDeals();
    loadCartFromStorage();
  }, []);

  const fetchSpecialDeals = async () => {
    try {
      const { data, error } = await supabase
        .from("special_deals")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error("Error fetching special deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem("smartmandi_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addDealToCart = (deal: SpecialDeal) => {
    // Check if this deal already exists in cart
    const existingIndex = cart.findIndex((item) => item.id === deal.id);

    let updatedCart;
    if (existingIndex !== -1) {
      // Increment quantity
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex
          ? { ...item, cartQuantity: (item.cartQuantity || 1) + 1 }
          : item
      );
    } else {
      // Add new item with quantity = 1
      const cartItem = {
        id: deal.id,
        name: deal.title,
        type: "special_deal",
        description: deal.description,
        posted_by_type: deal.posted_by_type,
        cartQuantity: 1,
      };
      updatedCart = [...cart, cartItem];
    }

    setCart(updatedCart);
    localStorage.setItem("smartmandi_cart", JSON.stringify(updatedCart));

    alert("Special deal added to cart! Contact details will be provided.");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Loading special deals...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Special Deals & Offers</h2>

      {deals.length === 0 ? (
        <p className="text-center text-gray-500">
          No active special deals found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{deal.title}</CardTitle>
                  <Badge variant="outline" className="text-orange-600">
                    {deal.posted_by_type === "vendor"
                      ? "Vendor Deal"
                      : "Firm Offer"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-700 mb-4">{deal.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(deal.created_at).toLocaleDateString()}
                  </span>

                  <Button
                    onClick={() => addDealToCart(deal)}
                    size="sm"
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
