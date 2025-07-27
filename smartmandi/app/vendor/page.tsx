"use client";
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// States and districts (reuse from firm dashboard)
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

export default function VendorPage() {
  const [dealForm, setDealForm] = useState({
    title: "",
    description: "",
    state: "",
    district: "",
  });
  const [dealLoading, setDealLoading] = useState(false);
  const [dealMessage, setDealMessage] = useState("");
  const [ownerName, setOwnerName] = useState("");

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
        posted_by: ownerName || "vendor",
        posted_by_type: "vendor",
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
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
      <div
        style={{
          background: "#f9f9f9",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: "2rem",
          maxWidth: "900px",
          margin: "0 auto",
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
          <input
            name="owner_name"
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
            type="text"
            placeholder="Owner Name"
            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "1rem" }}
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
    </main>
  );
}