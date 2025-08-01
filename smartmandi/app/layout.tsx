import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sabzimandi",
  description: "An app made for the ease of street vendors",
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
