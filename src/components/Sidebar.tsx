'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Heart, 
  Wallet, 
  Banknote, 
  TrendingDown, 
  Users, 
  Building,
  FileText,
  Menu,
  X,
  Database,
  CalendarHeart,
  Sparkles,
  LogOut
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  danger?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Zakat Fitrah', href: '/zakat-fitrah', icon: Heart },
  { name: 'Zakat Mal', href: '/zakat-mal', icon: Wallet },
  { name: 'Donatur Bulanan', href: '/donatur-bulanan', icon: CalendarHeart },
  { name: 'Tabungan Qurban', href: '/tabungan-qurban', icon: Sparkles },
  { name: 'Kas Harian', href: '/kas-harian', icon: Banknote },
  { name: 'Pengeluaran', href: '/pengeluaran', icon: TrendingDown },
  { name: 'Mustahiq', href: '/mustahiq', icon: Users },
  { name: 'Laporan', href: '/laporan', icon: FileText },
  { name: 'Reset Database', href: '/reset', icon: Database, danger: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (!confirm('Yakin ingin keluar?')) return;
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center justify-center border-b border-gray-100 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
            <Building className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800 block leading-tight">Sistem Administrasi</span>
            <span className="text-xs text-emerald-600 leading-tight">Masjid</span>
          </div>
        </div>
      </div>
      
      <nav className="mt-2 px-3 flex-1 overflow-y-auto">
        <ul className="space-y-0.5">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            const isDanger = item.danger;
            const showSeparator = index === navigation.length - 1 && isDanger;
            
            return (
              <li key={item.name}>
                {showSeparator && (
                  <div className="border-t border-gray-200 my-4 pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                      Zona Bahaya
                    </p>
                  </div>
                )}
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? isDanger 
                        ? 'bg-red-50 text-red-600 shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : isDanger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-gray-600 hover:bg-red-50 hover:text-red-600"
          suppressHydrationWarning
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald-600" />
            <span className="text-lg font-bold text-gray-900">Zakat Masjid</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white lg:border-r lg:border-gray-100 lg:flex lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
}