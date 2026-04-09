"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  size: string | null;
  price: number;
  image_url: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative w-full h-48 bg-gray-100">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        {product.size && (
          <p className="text-xs text-gray-500 mt-0.5">{product.size}</p>
        )}
        <p className="text-blue-600 font-bold mt-1">${product.price}</p>
        <button
          onClick={() => addItem(product)}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
