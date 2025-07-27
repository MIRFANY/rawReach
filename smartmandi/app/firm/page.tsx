"use client";
import { SpecialDealsSection } from "@/components/special-deals/SpecialDealsSection";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// States and districts (add more as needed)
const statesWithDistricts: { [key: string]: string[] } = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Pasighat"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangalore", "Hubli"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kannur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Manipur": ["Imphal", "Thoubal", "Churachandpur"],
  "Meghalaya": ["Shillong", "Tura", "Nongstoin"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Puri", "Sambalpur"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Ajmer"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Roorkee"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri"],
  "Andaman and Nicobar Islands": ["Port Blair", "Havelock", "Diglipur"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu"],
  "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Baramulla", "Anantnag"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Minicoy"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe"],
};
const stateList = Object.keys(statesWithDistricts);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FirmDashboard() {
  const [form, setForm] = useState({
    name: "",
    type: "",
    price: "",
    quantity: "",
    owner_name: "",
    description: "",
    contact_info: "",
    state: "",
    district: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Special Deals input state and handlers
  const [dealForm, setDealForm] = useState({
    title: "",
    description: "",
    state: "",
    district: "",
  });
  const [dealLoading, setDealLoading] = useState(false);
  const [dealMessage, setDealMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "state") {
      setForm({ ...form, state: value, district: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    // Prepare contact_info as JSON
    let contactInfo = {};
    try {
      contactInfo = JSON.parse(form.contact_info);
    } catch {
      contactInfo = { phone: form.contact_info };
    }
    const { error } = await supabase.from("listings").insert([
      {
        name: form.name,
        type: form.type,
        price: Number(form.price),
        quantity: Number(form.quantity),
        owner_name: form.owner_name,
        description: form.description,
        contact_info: contactInfo,
        state: form.state,
        district: form.district,
      },
    ]);
    setLoading(false);
    if (error) setMessage("Error: " + error.message);
    else {
      setMessage("Product added!");
      setForm({
        name: "",
        type: "",
        price: "",
        quantity: "",
        owner_name: "",
        description: "",
        contact_info: "",
        state: "",
        district: "",
      });
    }
  };

  // Special Deals handlers
  const handleDealChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setDealForm({ ...dealForm, [e.target.name]: e.target.value });
  };

  const handleDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDealLoading(true);
    setDealMessage("");
    const { error } = await supabase.from("special_deals").insert([
      {
        title: dealForm.title,
        description: dealForm.description,
        posted_by: form.owner_name || "firm",
        posted_by_type: "firm",
        status: "active",
        state: dealForm.state,
        district: dealForm.district,
      },
    ]);
    setDealLoading(false);
    if (error) setDealMessage("Error: " + error.message);
    else {
      setDealMessage("Special deal added!");
      setDealForm({ title: "", description: "", state: "", district: "" });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "2rem" }}>
        Firm Dashboard
      </h1>
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: "2rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Add New Listing</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Product name"
              style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            >
              <option value="">Select Type</option>
              <option value="sabzimandi">Sabzimandi</option>
              <option value="firm">Firm</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              placeholder="Price (₹)"
              style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            />
            <input
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              type="number"
              placeholder="Quantity (in KG)"
              style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            />
          </div>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <input
              name="owner_name"
              value={form.owner_name}
              onChange={handleChange}
              type="text"
              placeholder="Owner Name"
              style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            />
            <input
              name="contact_info"
              value={form.contact_info}
              onChange={handleChange}
              type="text"
              placeholder='Contact Info (e.g. {"phone":"1234567890"})'
              style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            />
          </div>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            >
              <option value="">Select State</option>
              {stateList.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <select
              name="district"
              value={form.district}
              onChange={handleChange}
              style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              required
              disabled={!form.state}
            >
              <option value="">Select District</option>
              {form.state &&
                statesWithDistricts[form.state]?.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
            </select>
          </div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ddd",
              minHeight: "80px",
              marginBottom: "1.5rem",
            }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#181818",
              color: "#fff",
              padding: "1rem",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "1.1rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Adding..." : "Add Listing"}
          </button>
        </form>

        {/* --- Special Deals Input Section --- */}
        <div
          style={{
            background: "#f9f9f9",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: "2rem",
            maxWidth: "900px",
            margin: "2rem auto 0 auto",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Add Special Deal</h2>
          <form onSubmit={handleDealSubmit}>
            <input
              name="title"
              value={dealForm.title}
              onChange={handleDealChange}
              type="text"
              placeholder="Deal Title"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "1rem" }}
              required
            />
            <textarea
              name="description"
              value={dealForm.description}
              onChange={handleDealChange}
              placeholder="Deal Description"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #ddd",
                minHeight: "80px",
                marginBottom: "1rem",
              }}
              required
            />
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <select
                name="state"
                value={dealForm.state}
                onChange={handleDealChange}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
                required
              >
                <option value="">Select State</option>
                {stateList.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <select
                name="district"
                value={dealForm.district}
                onChange={handleDealChange}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
                required
                disabled={!dealForm.state}
              >
                <option value="">Select District</option>
                {dealForm.state &&
                  statesWithDistricts[dealForm.state]?.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={dealLoading}
              style={{
                width: "100%",
                background: "#181818",
                color: "#fff",
                padding: "1rem",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "1.1rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              {dealLoading ? "Adding..." : "Add Special Deal"}
            </button>
          </form>
          {dealMessage && (
            <div style={{ marginTop: "1rem", color: dealMessage.startsWith("Error") ? "red" : "green" }}>
              {dealMessage}
            </div>
          )}
        </div>
        {/* --- End Special Deals Input Section --- */}

        <SpecialDealsSection />

         {message && (
          <div style={{ marginTop: "1rem", color: message.startsWith("Error") ? "red" : "green" }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}