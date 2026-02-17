import { NextResponse } from "next/server";
import { centsToZar, validateOrder } from "@/lib/checkout";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customer?: { name?: string; email?: string };
      items?: unknown;
    };

    const validated = validateOrder(body.items);

    const customerEmail = body.customer?.email?.trim();
    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email is required." }, { status: 400 });
    }

    const baseUrl = process.env.PEACH_BASE_URL;
    const accessToken = process.env.PEACH_ACCESS_TOKEN;
    const entityId = process.env.PEACH_ENTITY_ID;

    if (!baseUrl || !accessToken || !entityId) {
      return NextResponse.json(
        {
          error: "Peach is not configured. Add PEACH_BASE_URL, PEACH_ACCESS_TOKEN and PEACH_ENTITY_ID.",
        },
        { status: 500 },
      );
    }

    const amount = centsToZar(validated.amountCents);
    const merchantTransactionId = `SM-${Date.now()}`;

    const payload = new URLSearchParams({
      entityId,
      amount,
      currency: "ZAR",
      paymentType: "DB",
      merchantTransactionId,
      "customer.email": customerEmail,
    });

    const response = await fetch(`${baseUrl}/v1/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
      cache: "no-store",
    });

    const result = (await response.json()) as {
      id?: string;
      result?: { description?: string };
    };

    if (!response.ok || !result.id) {
      return NextResponse.json(
        {
          error: result?.result?.description ?? "Failed to initialize Peach checkout.",
        },
        { status: 502 },
      );
    }

    const hostedCheckoutBase = process.env.PEACH_HOSTED_CHECKOUT_URL;

    if (!hostedCheckoutBase) {
      return NextResponse.json({
        message:
          "Checkout initialized. Add PEACH_HOSTED_CHECKOUT_URL to auto-redirect to your payment widget page.",
      });
    }

    const hostedCheckoutUrl = `${hostedCheckoutBase}?checkoutId=${encodeURIComponent(result.id)}`;

    return NextResponse.json({
      hostedCheckoutUrl,
      checkoutId: result.id,
      amount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
