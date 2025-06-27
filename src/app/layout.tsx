import type { Metadata } from "next";

import "./globals.css";


export const metadata: Metadata = {
  title: "Mele y Cia",
  description: "Mele y Cia Distribuidora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
