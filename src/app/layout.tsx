import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from '../components/LayoutWrapper';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Administrasi Masjid",
  description: "Aplikasi untuk mengelola zakat fitrah, zakat mal, kas harian, pengeluaran, donatur bulanan, dan tabungan qurban masjid",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#10b981',
  manifest: '/manifest.json'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/Muhammadiyah.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/Muhammadiyah.jpeg" />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 to-gray-100 touch-pan-x touch-pan-y`} suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}