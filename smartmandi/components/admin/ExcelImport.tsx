// components/admin/ExcelImport.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ExcelImport() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/bulk-import", {
      method: "POST",
      body: fd,
    });
    const json = await res.json();
    setStatus(json.message || json.error);
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Excel Import</h1>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
      />
      <Button disabled={!file || busy} onClick={upload}>
        {busy ? "Importing…" : "Import"}
      </Button>
      {status && <p>{status}</p>}
    </div>
  );
}
