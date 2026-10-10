'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, HandCoins, LogIn } from 'lucide-react';

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/informasi', label: 'Informasi' },
  { href: '/kontak', label: 'Kontak Admin' },
  { href: '/infaq', label: 'Infaq & Sedekah' },
];

export default function PublicNav({ namaMasjid }: { namaMasjid: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-emerald-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 min-h-[44px] rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
            <img src="/Muhammadiyah.jpeg" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-100" />
            <span className="font-heading font-semibold text-emerald-900 leading-tight text-sm sm:text-base">
              {namaMasjid}
            </span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium min-h-[44px] inline-flex items-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                  isActive(l.href) ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-800'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/infaq"
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-900 min-h-[44px] shadow-sm hover:bg-amber-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              <HandCoins className="h-4 w-4" aria-hidden="true" />
              Infaq Sekarang
            </Link>
            <Link
              href="/login"
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-emerald-800 min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Admin
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Navigasi utama" className="md:hidden border-t border-emerald-100 bg-white px-4 pb-4 pt-2">
          <ul className="space-y-1">
            {links.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`block rounded-lg px-4 py-3 text-base font-medium min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                    isActive(l.href) ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/infaq" className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-900 min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300">
                <HandCoins className="h-5 w-5" aria-hidden="true" /> Infaq Sekarang
              </Link>
            </li>
            <li>
              <Link href="/login" className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm text-slate-500 min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
                <LogIn className="h-4 w-4" aria-hidden="true" /> Masuk Admin
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
