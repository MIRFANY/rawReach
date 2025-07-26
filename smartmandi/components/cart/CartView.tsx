// components/cart/CartView.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CartView() {
  const [cart, setCart] = useState<any[]>([]);
  const [groupedCart, setGroupedCart] = useState<any>({});

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    groupCartBySupplier();
  }, [cart]);

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem("smartmandi_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const groupCartBySupplier = () => {
    const grouped = cart.reduce((acc, item) => {
      const key = item.owner_type || item.posted_by_type || "unknown";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    setGroupedCart(grouped);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("smartmandi_cart");
  };

  const getContactInfo = (supplierType: string, items: any[]) => {
    // Extract contact information from item descriptions
    const contactInfo = items[0]?.description?.match(/Contact: ([^,]+)/)?.[1];
    const location = items[0]?.description?.match(/Location: ([^,]+)/)?.[1];

    return {
      contact: contactInfo || "Contact via platform",
      location: location || "Location to be provided",
      type: supplierType,
    };
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Your cart is empty</p>
          <Button className="mt-4">Continue Shopping</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedCart).map(
            ([supplierType, items]: [string, any]) => {
              const contactInfo = getContactInfo(supplierType, items);

              return (
                <Card key={supplierType} className="border-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline">{supplierType}</Badge>
                        Supplier Contact
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Contact Information */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">Contact Details:</h4>
                      <p className="text-sm">
                        <strong>Phone/Contact:</strong> {contactInfo.contact}
                      </p>
                      <p className="text-sm">
                        <strong>Location:</strong> {contactInfo.location}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <em>Contact directly to arrange pickup or delivery</em>
                      </p>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        Items from this supplier:
                      </h4>
                      {items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.price && (
                              <span className="text-green-600 ml-2">
                                ₹{item.price}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            Qty: {item.cartQuantity || 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <p className="text-sm text-gray-600">
              Total items:{" "}
              {cart.reduce((sum, item) => sum + (item.cartQuantity || 1), 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
