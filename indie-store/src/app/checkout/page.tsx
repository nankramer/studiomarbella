"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

type Gateway = "ozow" | "peach";
const CART_KEY = "studio_marbella_cart";

function formatZar(cents: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(cents / 100);
}

export default function CheckoutPage() {
  const [cart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [gateway, setGateway] = useState<Gateway>("ozow");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [cart],
  );

  const startCheckout = async () => {
    setError(null);

    if (!name || !email) {
      setError("Please enter your full name and email.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    setIsLoading(true);

    const response = await fetch(`/api/checkout/${gateway}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: { name, email },
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      redirectUrl?: string;
      hostedCheckoutUrl?: string;
      message?: string;
    };

    setIsLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Checkout request failed.");
      return;
    }

    if (payload.redirectUrl) {
      window.location.href = payload.redirectUrl;
      return;
    }

    if (payload.hostedCheckoutUrl) {
      window.location.href = payload.hostedCheckoutUrl;
      return;
    }

    setError(payload.message ?? "Gateway response missing redirect URL.");
  };

  return (
    <div className="min-h-screen bg-[var(--stone-bg)] text-[var(--ink-strong)]">
      <div className="mx-auto w-[min(820px,92vw)] py-10">
        <Link href="/" className="text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)] hover:underline">
          Back to store
        </Link>

        <h1 className="mt-4 font-serif text-5xl leading-none">Checkout</h1>

        <div className="mt-8 grid gap-4 rounded-sm border border-[var(--line-soft)] bg-[#fbf8f3] p-6">
          <label className="grid gap-2 text-sm">
            Full name
            <input
              className="rounded-sm border border-[var(--line-soft)] bg-white px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm">
            Email
            <input
              type="email"
              className="rounded-sm border border-[var(--line-soft)] bg-white px-3 py-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm">
            Payment gateway
            <select
              className="rounded-sm border border-[var(--line-soft)] bg-white px-3 py-2"
              value={gateway}
              onChange={(event) => setGateway(event.target.value as Gateway)}
            >
              <option value="ozow">Ozow</option>
              <option value="peach">Peach Payments</option>
            </select>
          </label>

          <div className="rounded-sm border border-[#e0d6c8] bg-[#f3ece1] p-3 text-sm">
            <p className="font-semibold">Order total: {formatZar(total)}</p>
            <p className="mt-1 text-[var(--ink-muted)]">Server recalculates totals from product IDs to prevent client-side price tampering.</p>
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <button
            type="button"
            onClick={startCheckout}
            disabled={isLoading}
            className="rounded-sm bg-[var(--ink-strong)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--stone-bg)] transition hover:bg-black disabled:opacity-60"
          >
            {isLoading ? "Starting checkout..." : "Pay now"}
          </button>
        </div>
      </div>
    </div>
  );
}
