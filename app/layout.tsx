import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Toaster } from 'react-hot-toast';

import Footer from "@/components/Footer";
import MetaPixel from "@/components/MetaPixel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://sh-reseller-hub.vercel.app'), // Replace with actual production URL if known
  title: {
    default: "SH Reseller Hub - Premium E-commerce Experience",
    template: "%s | SH Reseller Hub"
  },
  description: "SH Reseller Hub is your one-stop shop for premium gadgets, electronics, and accessories in Bangladesh. Discover top brands at the best prices.",
  keywords: ["SH Reseller Hub", "Gadgets Bangladesh", "Online Shopping BD", "Electronics Dhaka", "Premium Gadgets"],
  authors: [{ name: "SH Reseller Hub Team" }],
  creator: "SH Reseller Hub",
  publisher: "SH Reseller Hub",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://sh-reseller-hub.vercel.app",
    siteName: "SH Reseller Hub",
    title: "SH Reseller Hub - Premium Gadgets & Electronics",
    description: "Premium gadgets and electronics at your doorstep. Shop the latest tech with SH Reseller Hub.",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists or use a generic logo
        width: 1200,
        height: 630,
        alt: "SH Reseller Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SH Reseller Hub - Premium Gadgets & Electronics",
    description: "Premium gadgets and electronics at your doorstep.",
    images: ["/og-image.jpg"],
    creator: "@sh-reseller-hub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MetaPixel />
        <NextAuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </NextAuthProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
