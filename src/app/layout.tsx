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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}