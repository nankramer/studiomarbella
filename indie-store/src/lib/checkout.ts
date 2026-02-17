import { productMap } from "@/lib/products";

export type CheckoutItem = {
  productId: string;
  quantity: number;
};

export type ValidatedOrder = {
  amountCents: number;
  lineItems: Array<{
    productId: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }>;
};

export function validateOrder(items: unknown): ValidatedOrder {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must include at least one item.");
  }

  const lineItems: ValidatedOrder["lineItems"] = [];

  for (const rawItem of items) {
    if (!rawItem || typeof rawItem !== "object") {
      throw new Error("Invalid order item.");
    }

    const item = rawItem as CheckoutItem;
    const quantity = Number(item.quantity);

    if (!item.productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error("Invalid product or quantity.");
    }

    const product = productMap.get(item.productId);
    if (!product || !product.inStock) {
      throw new Error(`Product unavailable: ${item.productId}`);
    }

    const lineTotalCents = product.priceCents * quantity;

    lineItems.push({
      productId: product.id,
      quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents,
    });
  }

  const amountCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);

  if (amountCents <= 0) {
    throw new Error("Invalid order total.");
  }

  return {
    amountCents,
    lineItems,
  };
}

export function centsToZar(cents: number): string {
  return (cents / 100).toFixed(2);
}
