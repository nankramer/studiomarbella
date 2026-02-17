import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { centsToZar, validateOrder } from "@/lib/checkout";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customer?: { name?: string; email?: string };
      items?: unknown;
    };

    const validated = validateOrder(body.items);

    const customerName = body.customer?.name?.trim();
    const customerEmail = body.customer?.email?.trim();

    if (!customerName || !customerEmail) {
      return NextResponse.json({ error: "Customer details are required." }, { status: 400 });
    }

    const siteCode = process.env.OZOW_SITE_CODE;
    const privateKey = process.env.OZOW_PRIVATE_KEY;

    if (!siteCode || !privateKey) {
      return NextResponse.json(
        {
          error: "Ozow is not configured. Add OZOW_SITE_CODE and OZOW_PRIVATE_KEY in env.",
        },
        { status: 500 },
      );
    }

    const isTest = process.env.OZOW_IS_TEST === "true" ? "true" : "false";
    const endpoint = process.env.OZOW_ENDPOINT ?? "https://pay.ozow.com";
    const successUrl = process.env.CHECKOUT_SUCCESS_URL ?? "http://localhost:3000/checkout/success";
    const cancelUrl = process.env.CHECKOUT_CANCEL_URL ?? "http://localhost:3000/checkout/cancel";
    const errorUrl = process.env.CHECKOUT_ERROR_URL ?? "http://localhost:3000/checkout/error";

    const amount = centsToZar(validated.amountCents);
    const transactionReference = `SM-${Date.now()}`;
    const bankReference = transactionReference;

    // Verify signature algorithm and field order against the latest Ozow docs before production.
    const signatureInput = [
      siteCode,
      "ZA",
      "ZAR",
      amount,
      transactionReference,
      bankReference,
      cancelUrl,
      errorUrl,
      successUrl,
      isTest,
      privateKey,
    ].join("");

    const hashCheck = crypto.createHash("sha512").update(signatureInput).digest("hex");

    const redirectUrl = `${endpoint}/?SiteCode=${encodeURIComponent(siteCode)}&CountryCode=ZA&CurrencyCode=ZAR&Amount=${encodeURIComponent(amount)}&TransactionReference=${encodeURIComponent(transactionReference)}&BankReference=${encodeURIComponent(bankReference)}&Customer=${encodeURIComponent(customerName)}&CustomerEmail=${encodeURIComponent(customerEmail)}&CancelUrl=${encodeURIComponent(cancelUrl)}&ErrorUrl=${encodeURIComponent(errorUrl)}&SuccessUrl=${encodeURIComponent(successUrl)}&IsTest=${isTest}&HashCheck=${hashCheck}`;

    return NextResponse.json({
      redirectUrl,
      reference: transactionReference,
      amount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
