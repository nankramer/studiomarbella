import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio Marbella | Independent Store",
  description: "Platform-independent ecommerce starter with Ozow and Peach checkout initialization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <body>{children}</body>
    </html>
  );
}
