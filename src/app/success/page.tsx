"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="max-w-md mx-auto text-center mt-16">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Received!</h1>
      {orderId && (
        <p className="text-gray-500 text-sm mb-1">Order ID: #{orderId}</p>
      )}
      <p className="text-gray-500 mt-4 mb-8">
        Check your email for your invoice.
        <br />
        <span className="text-xs text-gray-400">
          (No payment required — prototype)
        </span>
      </p>
      <Link
        href="/"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
