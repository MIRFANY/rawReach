// app/cart/page.tsx
"use client";

import { CartView } from "@/components/cart/CartView";

export default function CartPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 min-h-screen">
      <CartView />
    </main>
  );
}
