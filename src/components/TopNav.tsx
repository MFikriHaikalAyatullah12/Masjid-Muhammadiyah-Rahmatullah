'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Heart,
  Wallet,
  TrendingDown,
  Users,
  FileText,
  Menu,
  X,
  Database,
  CalendarHeart,
  Sparkles,
  LogOut,
  HandHeart,
  Coins,
  Inbox,
  Globe,
  Settings,
  HandCoins,
  ChevronDown,
  type LucideIcon
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  danger?: boolean;
}

interface NavGroup {
  name: string;
  icon: LucideIcon;
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry;

const navigation: NavEntry[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Penerimaan',
    icon: HandCoins,
    items: [
      { name: 'Infaq Online', href: '/infaq-online', icon: Inbox, description: 'Konfirmasi dari website publik' },
      { name: 'Infaq & Sedekah', href: '/data-infaq', icon: HandCoins, description: 'Pencatatan infaq harian' },
      { name: 'Zakat Fitrah', href: '/zakat-fitrah', icon: Heart, description: 'Muzakki dan pembayaran' },
      { name: 'Zakat Mal', href: '/zakat-mal', icon: Coins, description: 'Zakat harta dan perhitungan' },
      { name: 'Donatur Bulanan', href: '/donatur-bulanan', icon: HandHeart, description: 'Donatur rutin dan setoran' },
      { name: 'Tabungan Qurban', href: '/tabungan-qurban', icon: Sparkles, description: 'Peserta dan progres tabungan' }
    ]
  },
  {
    name: 'Keuangan',
    icon: Wallet,
    items: [
      { name: 'Kas Harian', href: '/kas-harian', icon: Wallet, description: 'Pemasukan kas masjid' },
      { name: 'Pengeluaran', href: '/pengeluaran', icon: TrendingDown, description: 'Belanja dan operasional' }
    ]
  },
  { name: 'Mustahiq', href: '/mustahiq', icon: Users },
  {
    name: 'Laporan',
    icon: FileText,
    items: [
      { name: 'Laporan Keuangan', href: '/laporan', icon: FileText, description: 'Rekap penerimaan dan pengeluaran' },
      { name: 'Laporan Tabungan', href: '/laporan/tabungan-qurban', icon: CalendarHeart, description: 'Rekap tabungan qurban' }
    ]
  },
  {
    name: 'Pengaturan',
    icon: Settings,
    items: [
      { name: 'Pengaturan Website', href: '/pengaturan-website', icon: Settings, description: 'Konten dan informasi publik' },
      { name: 'Reset Database', href: '/reset', icon: Database, description: 'Hapus seluruh data', danger: true }
    ]
  }
];

const itemClass = (active: boolean, danger?: boolean) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-[44px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
    active
      ? danger
        ? 'bg-rose-50 text-rose-700'
        : 'bg-emerald-50 text-emerald-800'
      : danger
        ? 'text-rose-600 hover:bg-rose-50'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
  }`;

const topLinkClass = (active: boolean) =>
  `inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
    active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
  }`;

function DesktopDropdown({
  group,
  pathname,
  open,
  onToggle,
  onClose
}: {
  group: NavGroup;
  pathname: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const active = group.items.some((i) => i.href === pathname);
  const panelId = `nav-${group.name.toLowerCase()}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`${topLinkClass(active || open)} ${open ? 'bg-slate-100' : ''}`}
      >
        {group.name}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200 z-50"
        >
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${itemClass(isActive, item.danger)} items-start`}
                  >
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block leading-tight">{item.name}</span>
                      {item.description && (
                        <span className={`block text-xs font-normal mt-0.5 ${item.danger ? 'text-rose-500' : 'text-slate-500'}`}>
                          {item.description}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

const TopNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close menus on route change
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!openGroup && !mobileOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openGroup, mobileOpen]);

  // Lock body scroll while the mobile panel is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = useCallback(async () => {
    if (!confirm('Yakin ingin keluar?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const closeAll = useCallback(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, []);

  return (
    <header ref={navRef} className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0 shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" onClick={closeAll}>
            <img
              src="/Muhammadiyah.jpeg"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-100"
            />
            <span className="min-w-0 hidden sm:block">
              <span className="block text-sm font-semibold text-slate-900 leading-tight truncate max-w-[200px] xl:max-w-none">
                Masjid Muhammadiyah Rahmatullah
              </span>
              <span className="block text-xs text-slate-500 leading-tight">Panel Administrasi</span>
            </span>
            <span className="sm:hidden text-sm font-semibold text-slate-900">Admin Masjid</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Menu admin">
            {navigation.map((entry) =>
              isGroup(entry) ? (
                <DesktopDropdown
                  key={entry.name}
                  group={entry}
                  pathname={pathname}
                  open={openGroup === entry.name}
                  onToggle={() => setOpenGroup((g) => (g === entry.name ? null : entry.name))}
                  onClose={closeAll}
                />
              ) : (
                <Link
                  key={entry.href}
                  href={entry.href}
                  aria-current={pathname === entry.href ? 'page' : undefined}
                  className={topLinkClass(pathname === entry.href)}
                  onClick={closeAll}
                >
                  {entry.name}
                </Link>
              )
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xl:inline">Website Publik</span>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden lg:inline-flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xl:inline">Keluar</span>
            </button>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-slate-900/40 z-40" aria-hidden="true" onClick={closeAll} />
          <nav
            id="mobile-nav"
            aria-label="Menu admin"
            className="lg:hidden absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-white border-b border-slate-200 shadow-lg"
          >
            <div className="px-4 py-4 space-y-5">
              {navigation.map((entry) =>
                isGroup(entry) ? (
                  <div key={entry.name}>
                    <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{entry.name}</p>
                    <ul className="space-y-0.5">
                      {entry.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <li key={item.href}>
                            <Link href={item.href} onClick={closeAll} aria-current={isActive ? 'page' : undefined} className={itemClass(isActive, item.danger)}>
                              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    onClick={closeAll}
                    aria-current={pathname === entry.href ? 'page' : undefined}
                    className={itemClass(pathname === entry.href)}
                  >
                    <entry.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>{entry.name}</span>
                  </Link>
                )
              )}

              <div className="border-t border-slate-200 pt-4 space-y-0.5">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 min-h-[44px] transition-colors duration-150"
                >
                  <Globe className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Lihat Website Publik</span>
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 min-h-[44px] transition-colors duration-150 cursor-pointer"
                >
                  <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default TopNav;