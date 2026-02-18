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
    <div className="min-h-screen bg-[var(--stone-bg)] text-[var(--ink-strong)]">
      <header className="border-b border-[var(--line-soft)] bg-[#f7f3ec]/80 backdrop-blur-sm">
        <div className="mx-auto flex w-[min(1240px,92vw)] items-center justify-between py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--ink-muted)]">Collection</p>
            <h1 className="font-serif text-4xl leading-none">Studio Marbella</h1>
          </div>
          <Link
            href="/checkout"
            className="rounded-sm border border-[var(--ink-strong)] px-5 py-2 text-xs uppercase tracking-[0.18em] transition hover:bg-[var(--ink-strong)] hover:text-[var(--stone-bg)]"
          >
            Checkout ({cartCount})
          </Link>
        </div>
      </header>

      <section className="mx-auto w-[min(1240px,92vw)] py-14">
        <div className="mb-10 max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--ink-muted)]">Curated marble objects</p>
          <h2 className="mt-2 font-serif text-5xl leading-[0.95] md:text-6xl">Marble furniture, lighting and objet</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-sm border border-[var(--line-soft)] bg-[#fbf8f3] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(30,26,23,0.07)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="space-y-3 p-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ink-muted)]">{product.category}</p>
                <h3 className="font-serif text-[1.85rem] leading-[1.03]">{product.name}</h3>
                <p className="text-sm text-[#4f473e]">{product.description}</p>
                <p className="text-base">{formatZar(product.priceCents)}</p>
                <button
                  type="button"
                  className="w-full rounded-sm bg-[var(--ink-strong)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--stone-bg)] transition hover:bg-black"
                  onClick={() => addToCart(product)}
                >
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--line-soft)] py-6">
        <div className="mx-auto flex w-[min(1240px,92vw)] items-center justify-between text-sm text-[var(--ink-muted)]">
          <p>Cart total: {formatZar(cartTotal)}</p>
          <p>Independent commerce build</p>
        </div>
      </footer>
    </div>
  );
}
