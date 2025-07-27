// components/marketplace/CartView.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  id: string;
  name: string;
  price?: number; // total package price
  cartQuantity: number;
  owner_type?: string;
  posted_by_type?: string;
  description?: string;
  contact_info?: {
    phone?: string;
    email?: string;
    location?: string;
  };
}

export function CartView() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [groupedCart, setGroupedCart] = useState<Record<string, CartItem[]>>(
    {}
  );

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("smartmandi_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        localStorage.removeItem("smartmandi_cart");
      }
    }
  }, []);

  // Regroup and sync to localStorage when cart changes
  useEffect(() => {
    const groups = cart.reduce((acc, item) => {
      const key = item.posted_by_type || item.owner_type || "unknown";
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    setGroupedCart(groups);
    localStorage.setItem("smartmandi_cart", JSON.stringify(cart));
  }, [cart]);

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("smartmandi_cart");
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cartQuantity: qty } : item
      )
    );
  };

  const extractContact = useCallback((items: CartItem[]) => {
    const item = items[0];
    if (item.contact_info) {
      return {
        contact:
          item.contact_info.phone ||
          item.contact_info.email ||
          "Contact via platform",
        location: item.contact_info.location || "Location TBD",
      };
    }
    const desc = item.description || "";
    const phoneMatch = desc.match(/(?:Contact|Phone):\s*([\d+-]+)/i);
    const emailMatch = desc.match(
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/i
    );
    const locMatch = desc.match(/Location:\s*([^,]+)/i);
    return {
      contact: phoneMatch?.[1] || emailMatch?.[0] || "Contact via platform",
      location: locMatch?.[1]?.trim() || "Location TBD",
    };
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

  return (
    <div className="container mx-auto p-6 max-w-3xl min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-gray-500 text-lg">Your cart is empty.</p>
          <Button variant="outline" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {Object.entries(groupedCart).map(([supplierType, items]) => {
              const { contact, location } = extractContact(items);
              return (
                <Card key={supplierType} className="border shadow-sm">
                  <CardHeader>
                    <div className="flex items-center">
                      <Badge variant="outline" className="capitalize mr-2">
                        {supplierType}
                      </Badge>
                      Supplier Contact
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <p className="text-sm">
                        <strong>Contact:</strong> {contact}
                      </p>
                      <p className="text-sm">
                        <strong>Location:</strong> {location}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded"
                        >
                          <div className="flex-1">
                            <p className="font-medium truncate">{item.name}</p>
                            {item.price !== undefined && (
                              <p className="text-sm text-green-600">
                                ₹{item.price.toFixed(2)} total
                                {item.cartQuantity > 1 && (
                                  <>
                                    {" "}
                                    · ₹
                                    {(item.price / item.cartQuantity).toFixed(
                                      2
                                    )}
                                    /kg
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min={1}
                              value={item.cartQuantity}
                              onChange={(e) =>
                                updateQuantity(item.id, Number(e.target.value))
                              }
                              className="w-16 border rounded px-2 py-1 text-center"
                            />
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove item"
                              className="text-red-600 hover:text-red-800 text-xl font-bold"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-8 flex justify-between items-center">
            <Button variant="destructive" onClick={clearCart}>
              Clear Cart
            </Button>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700 font-semibold">
                Total Items: {totalItems}
              </p>
              <Button onClick={() => router.push("/cart")}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
