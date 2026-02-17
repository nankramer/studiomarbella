"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";

type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

const CART_KEY = "studio_marbella_cart";

function formatZar(cents: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function Storefront({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
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

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [cart],
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(20, item.quantity + 1) }
            : item,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          quantity: 1,
        },
      ];
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-[#1e1a17]">
      <header className="border-b border-[#d8d0c4]">
        <div className="mx-auto flex w-[min(1200px,92vw)] items-center justify-between py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#6d6458]">Independent Commerce Build</p>
            <h1 className="font-serif text-3xl">Studio Marbella</h1>
          </div>
          <Link
            href="/checkout"
            className="rounded border border-[#1e1a17] px-4 py-2 text-sm uppercase tracking-[0.12em] hover:bg-[#1e1a17] hover:text-[#f4f1eb]"
          >
            Checkout ({cartCount})
          </Link>
        </div>
      </header>

      <section className="mx-auto w-[min(1200px,92vw)] py-10">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#6d6458]">No Shopify</p>
          <h2 className="font-serif text-4xl md:text-5xl">Marble furniture, lighting and objet</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded border border-[#d8d0c4] bg-[#fcfbf8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="h-64 w-full object-cover"
                loading="lazy"
              />
              <div className="space-y-3 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#6d6458]">{product.category}</p>
                <h3 className="font-serif text-2xl leading-tight">{product.name}</h3>
                <p className="text-sm text-[#4d453c]">{product.description}</p>
                <p className="text-lg">{formatZar(product.priceCents)}</p>
                <button
                  type="button"
                  className="w-full rounded bg-[#1e1a17] px-3 py-2 text-sm uppercase tracking-[0.12em] text-[#f4f1eb] hover:bg-[#000]"
                  onClick={() => addToCart(product)}
                >
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#d8d0c4] py-6">
        <div className="mx-auto flex w-[min(1200px,92vw)] items-center justify-between text-sm text-[#6d6458]">
          <p>Cart total: {formatZar(cartTotal)}</p>
          <p>Use Cloudflare + Vercel with your own gateway credentials.</p>
        </div>
      </footer>
    </div>
  );
}
