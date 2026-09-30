import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainLayout } from '@/components/layout/MainLayout';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Gismar Karonen",
    default: "Gismar Karonen - Colecciones de Arte",
  },
  description: "Obras que fusionan colores, texturas y emociones, creadas para transformar cualquier espacio.",
  openGraph: {
    type: "website",
    siteName: "Gismar Karonen",
    title: "Gismar Karonen - Colecciones de Arte",
    description: "Obras que fusionan colores, texturas y emociones, creadas para transformar cualquier espacio.",
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <CartProvider>
            <MainLayout>{children}</MainLayout>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
