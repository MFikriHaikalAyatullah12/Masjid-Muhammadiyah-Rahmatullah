import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, memo } from 'react';
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
  LogOut,
  HandHeart,
  Coins,
  Inbox,
  Globe,
  Settings,
  HandCoins
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  danger?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Infaq Online', href: '/infaq-online', icon: Inbox },
  { name: 'Infaq & Sedekah', href: '/data-infaq', icon: HandCoins },
  { name: 'Zakat Fitrah', href: '/zakat-fitrah', icon: Heart },
  { name: 'Zakat Mal', href: '/zakat-mal', icon: Coins },
  { name: 'Donatur Bulanan', href: '/donatur-bulanan', icon: HandHeart },
  { name: 'Tabungan Qurban', href: '/tabungan-qurban', icon: Sparkles },
  { name: 'Kas Harian', href: '/kas-harian', icon: Wallet },
  { name: 'Pengeluaran', href: '/pengeluaran', icon: TrendingDown },
  { name: 'Mustahiq', href: '/mustahiq', icon: Users },
  { name: 'Laporan', href: '/laporan', icon: FileText },
  { name: 'Laporan Tabungan', href: '/laporan/tabungan-qurban', icon: CalendarHeart },
  { name: 'Pengaturan Website', href: '/pengaturan-website', icon: Settings },
  { name: 'Reset Database', href: '/reset', icon: Database, danger: true },
];

// Optimized navigation item component
const NavigationItem = memo(({ item, pathname, onClick, onNavigate }: { 
  item: NavigationItem; 
  pathname: string; 
  onClick?: () => void;
  onNavigate?: (href: string) => void;
}) => {
  const isActive = pathname === item.href;
  const IconComponent = item.icon;
  const isDanger = item.danger;
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    onClick?.();
    onNavigate?.(item.href);
  }, [onClick, onNavigate, item.href]);
  
  return (
    <Link
      href={item.href}
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 min-h-[44px] touch-manipulation ${
        isActive
          ? isDanger 
            ? 'bg-rose-50 text-rose-700'
            : 'bg-emerald-50 text-emerald-800'
          : isDanger
            ? 'text-rose-600 hover:bg-rose-50'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
      aria-current={isActive ? 'page' : undefined}
      prefetch={true}
      replace={false}
    >
      <IconComponent className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{item.name}</span>
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);
  
  // Instant navigation handler
  const handleNavigation = useCallback((href: string) => {
    setIsNavigating(true);
    closeMobileMenu();
    // Reset navigation state after transition
    setTimeout(() => setIsNavigating(false), 300);
  }, [closeMobileMenu]);

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200">
        <img src="/Muhammadiyah.jpeg" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-100" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 leading-tight truncate">Masjid Muhammadiyah Rahmatullah</p>
          <p className="text-xs text-slate-500">Panel Administrasi</p>
        </div>
      </div>
      
      <nav className="mt-4 px-3 flex-1 overflow-y-auto" aria-label="Menu admin">
        <ul className="space-y-0.5">
          {navigation.map((item, index) => {
            const showSeparator = index === navigation.length - 1 && item.danger;
            
            return (
              <li key={item.name}>
                {showSeparator && (
                  <div className="border-t border-slate-200 my-4 pt-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                      Zona Bahaya
                    </p>
                  </div>
                )}
                <NavigationItem 
                  item={item} 
                  pathname={pathname} 
                  onClick={closeMobileMenu}
                  onNavigate={handleNavigation}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-3 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 min-h-[44px] touch-manipulation transition-colors duration-150"
        >
          <Globe className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span>Lihat Website Publik</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 w-full text-slate-600 hover:bg-rose-50 hover:text-rose-700 min-h-[44px] touch-manipulation"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/Muhammadiyah.jpeg" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            <span className="text-base font-semibold text-slate-900">Admin Masjid</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
            className="p-3 rounded-lg text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] touch-manipulation"
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white lg:border-r lg:border-slate-200 lg:flex lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;