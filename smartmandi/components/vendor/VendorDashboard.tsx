// components/vendor/VendorDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function VendorDashboard() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    phone: "",
    location: "",
  });
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("type", "vendor")
      .order("created_at", { ascending: false });
    setMyListings(data || []);
  };

  const createListing = async () => {
    setLoading(true);
    await supabase.from("listings").insert({
      name: form.name,
      type: "vendor",
      price: Number(form.price),
      quantity: Number(form.quantity),
      owner_name: "Vendor (no-auth)",
      description: form.description,
      contact_info: { phone: form.phone, location: form.location },
    });
    setForm({
      name: "",
      price: "",
      quantity: "",
      description: "",
      phone: "",
      location: "",
    });
    await refresh();
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Vendor Dashboard</h1>

      {/* create */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Add New Listing</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Price (₹)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Button onClick={createListing} disabled={loading}>
          {loading ? "Adding…" : "Add Listing"}
        </Button>
      </Card>

      {/* list */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myListings.map((l) => (
          <Card key={l.id} className="p-4">
            <h3 className="font-semibold">{l.name}</h3>
            <p className="text-sm text-gray-700">{l.description}</p>
            <p className="mt-2 font-medium text-green-600">₹{l.price}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
