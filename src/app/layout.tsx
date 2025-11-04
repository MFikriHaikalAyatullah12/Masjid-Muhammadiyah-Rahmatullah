import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from '../components/Sidebar';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Manajemen Zakat - Masjid Muhammadiyah Rahmatullah",
  description: "Aplikasi untuk mengelola zakat fitrah, zakat mal, kas harian, dan pengeluaran Masjid Muhammadiyah Rahmatullah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body 
        className={`${inter.className} text-gray-900`}
        style={{
          backgroundColor: '#90EE90'
        }}
      >
        <div 
          className="min-h-screen"
          style={{
            backgroundColor: '#90EE90'
          }}
        >
          <Sidebar />
          <main className="lg:pl-64 pt-16 lg:pt-0">
            <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}