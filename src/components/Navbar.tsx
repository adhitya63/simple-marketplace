"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-gray-900">
          🛒 Marketplace
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            Products
          </Link>
          <Link
            href="/checkout"
            className="relative flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
          >
            Cart
            {itemCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin"
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
