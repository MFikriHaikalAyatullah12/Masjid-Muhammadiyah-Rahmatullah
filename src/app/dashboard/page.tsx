'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Coins, TrendingDown, Users, Wallet, Inbox, ArrowRight, LayoutDashboard } from 'lucide-react';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import RecentTransactions from '@/components/RecentTransactions';
import DashboardCharts from '@/components/DashboardCharts';
import Loading from '@/components/Loading';

interface DashboardStats {
  zakatFitrah: { count: number; total: number };
  zakatMal: { count: number; total: number };
  pengeluaran: { count: number; total: number };
  distribusi: { count: number; total: number };
  currentSaldo: number;
  recentTransactions: any[];
}

const EMPTY: DashboardStats = {
  zakatFitrah: { count: 0, total: 0 },
  zakatMal: { count: 0, total: 0 },
  pengeluaran: { count: 0, total: 0 },
  distribusi: { count: 0, total: 0 },
  currentSaldo: 0,
  recentTransactions: [],
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingInfaq, setPendingInfaq] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetch('/api/infaq-online?status=pending', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => d && setPendingInfaq(d.pendingCount || 0))
      .catch(() => {});
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data || typeof data !== 'object') throw new Error('Invalid response');
      setStats({
        zakatFitrah: data.zakatFitrah || EMPTY.zakatFitrah,
        zakatMal: data.zakatMal || EMPTY.zakatMal,
        pengeluaran: data.pengeluaran || EMPTY.pengeluaran,
        distribusi: data.distribusi || EMPTY.distribusi,
        currentSaldo: typeof data.currentSaldo === 'number' ? data.currentSaldo : 0,
        recentTransactions: Array.isArray(data.recentTransactions) ? data.recentTransactions : [],
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(EMPTY);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Memuat ringkasan keuangan…" icon={<LayoutDashboard className="w-5 h-5" />} />
        <Loading type="skeleton" text="Memuat dashboard..." />
      </div>
    );
  }

  const s = stats || EMPTY;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={today}
        icon={<LayoutDashboard className="w-5 h-5" />}
        actions={
          <Link href="/kas-harian" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
            <Wallet className="w-4 h-4" aria-hidden="true" /> Catat Transaksi
          </Link>
        }
      />

      {pendingInfaq > 0 && (
        <Link
          href="/infaq-online"
          className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200 hover:bg-amber-100 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
        >
          <span className="flex items-center gap-3 text-sm text-amber-900">
            <Inbox className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span><strong>{pendingInfaq}</strong> konfirmasi infaq online menunggu verifikasi.</span>
          </span>
          <ArrowRight className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
        </Link>
      )}

      {/* Saldo utama + 4 kartu ringkas */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="judul-saldo" className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-6 text-white shadow-md lg:row-span-2 flex flex-col justify-between">
          <div>
            <p id="judul-saldo" className="text-sm font-medium text-emerald-100">Saldo Kas Masjid</p>
            <p className="mt-2 text-3xl sm:text-4xl font-semibold tabular-nums break-words">{formatCurrency(s.currentSaldo)}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-4 text-sm">
            <div>
              <p className="text-emerald-200 text-xs">Total pengeluaran</p>
              <p className="font-semibold tabular-nums">{formatCurrency(s.pengeluaran.total)}</p>
            </div>
            <div>
              <p className="text-emerald-200 text-xs">Dana tersalurkan</p>
              <p className="font-semibold tabular-nums">{formatCurrency(s.distribusi.total)}</p>
            </div>
          </div>
          <Link href="/laporan" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-amber-300 hover:text-amber-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 rounded">
            Lihat laporan lengkap <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>

        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <StatCard title="Zakat Fitrah" value={formatCurrency(s.zakatFitrah.total)} count={`${s.zakatFitrah.count} muzakki`} icon={<Heart className="w-5 h-5" />} color="teal" />
          <StatCard title="Zakat Mal" value={formatCurrency(s.zakatMal.total)} count={`${s.zakatMal.count} muzakki`} icon={<Coins className="w-5 h-5" />} color="amber" />
          <StatCard title="Total Pengeluaran" value={formatCurrency(s.pengeluaran.total)} count={`${s.pengeluaran.count} transaksi`} icon={<TrendingDown className="w-5 h-5" />} color="rose" />
          <StatCard title="Dana Tersalurkan" value={formatCurrency(s.distribusi.total)} count={`${s.distribusi.count} mustahiq terbantu`} icon={<Users className="w-5 h-5" />} color="purple" />
        </div>
      </div>

      {/* Grafik */}
      <section aria-labelledby="judul-grafik" className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="judul-grafik" className="text-base font-semibold text-slate-900">Analisis Keuangan</h2>
            <p className="text-xs text-slate-500">Pemasukan dan pengeluaran bulanan</p>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <DashboardCharts />
        </div>
      </section>

      {/* Aktivitas terbaru */}
      <section aria-labelledby="judul-aktivitas" className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="judul-aktivitas" className="text-base font-semibold text-slate-900">Aktivitas Terbaru</h2>
            <p className="text-xs text-slate-500">Transaksi kas terakhir</p>
          </div>
          <Link href="/kas-harian" className="text-sm font-medium text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 rounded px-1">
            Semua <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="p-4 sm:p-5">
          <RecentTransactions transactions={s.recentTransactions} />
        </div>
      </section>
    </div>
  );
}
