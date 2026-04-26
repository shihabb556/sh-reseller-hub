import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Toaster } from 'react-hot-toast';

import Footer from "@/components/Footer";
import MetaPixel from "@/components/MetaPixel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://gadget-bazar-bd.vercel.app'), // Replace with actual production URL if known
  title: {
    default: "Gadget Bazar BD - Premium E-commerce Experience",
    template: "%s | Gadget Bazar BD"
  },
  description: "Gadget Bazar BD is your one-stop shop for premium gadgets, electronics, and accessories in Bangladesh. Discover top brands at the best prices.",
  keywords: ["Gadget Bazar BD", "Gadgets Bangladesh", "Online Shopping BD", "Electronics Dhaka", "Premium Gadgets"],
  authors: [{ name: "Gadget Bazar BD Team" }],
  creator: "Gadget Bazar BD",
  publisher: "Gadget Bazar BD",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://gadget-bazar-bd.vercel.app",
    siteName: "Gadget Bazar BD",
    title: "Gadget Bazar BD - Premium Gadgets & Electronics",
    description: "Premium gadgets and electronics at your doorstep. Shop the latest tech with Gadget Bazar BD.",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists or use a generic logo
        width: 1200,
        height: 630,
        alt: "Gadget Bazar BD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gadget Bazar BD - Premium Gadgets & Electronics",
    description: "Premium gadgets and electronics at your doorstep.",
    images: ["/og-image.jpg"],
    creator: "@gadget-bazar-bd",
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
