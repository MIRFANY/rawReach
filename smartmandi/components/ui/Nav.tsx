// components/ui/Nav.tsx
import Link from "next/link";

export function Nav() {
  return (
    <nav className="bg-gray-800 text-white px-4 py-2 space-x-4">
      <Link href="/">Market</Link>
      <Link href="/cart">Cart</Link>
      <Link href="/vendor">Vendor</Link>
      <Link href="/admin">Admin</Link>
    </nav>
  );
}

// Wrap <Nav /> in your root layout
