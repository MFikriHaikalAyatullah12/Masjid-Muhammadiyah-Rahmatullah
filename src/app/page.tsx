'use client';

import { useEffect, useState } from 'react';
import { Building, Heart, Wallet, TrendingUp, TrendingDown, Users } from 'lucide-react';
import StatCard from '@/components/StatCard';
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

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard stats...');
      
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dashboard API error:', response.status, errorText);
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          console.log('Unauthorized access, redirecting to login...');
          window.location.href = '/login';
          return;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Dashboard stats received:', data);
      
      // Validate the response data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response data format');
      }
      
      setStats({
        zakatFitrah: data.zakatFitrah || { count: 0, total: 0 },
        zakatMal: data.zakatMal || { count: 0, total: 0 },
        pengeluaran: data.pengeluaran || { count: 0, total: 0 },
        distribusi: data.distribusi || { count: 0, total: 0 },
        currentSaldo: typeof data.currentSaldo === 'number' ? data.currentSaldo : 0,
        recentTransactions: Array.isArray(data.recentTransactions) ? data.recentTransactions : []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values on error
      setStats({
        zakatFitrah: { count: 0, total: 0 },
        zakatMal: { count: 0, total: 0 },
        pengeluaran: { count: 0, total: 0 },
        distribusi: { count: 0, total: 0 },
        currentSaldo: 0,
        recentTransactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Zakat</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Memuat data sistem manajemen zakat masjid...</p>
        </div>
        <Loading type="skeleton" text="Memuat dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50">
      {/* Islamic Header with Mosque Pattern */}
      <div className="relative mb-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-amber-600 opacity-90">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M30 30l15-15v30l-15-15zM15 15l15 15-15 15V15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              {/* Bismillah */}
              <div className="mb-6">
                <p className="text-white/90 text-lg font-arabic mb-2">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                <p className="text-white/70 text-sm italic">"Dengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang"</p>
              </div>
              
              {/* Main Title */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Sistem Administrasi Masjid
                  </h1>
                  <div className="h-1 w-32 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full mx-auto" />
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
                Sistem Manajemen Zakat, Infaq, dan Shadaqah<br/>
                <span className="text-white/70 text-base">Mengelola amanah umat dengan transparansi dan keberkahan</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Islamic Stats Cards */}
      <div className="px-6 mb-12">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Laporan Keuangan Terkini</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-teal-300" />
              <div className="w-2 h-2 bg-teal-500 rounded-full" />
              <div className="h-px w-12 bg-teal-300" />
            </div>
          </div>
          
          {/* Main Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Zakat Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                title="Zakat Fitrah"
                value={formatCurrency(stats?.zakatFitrah?.total || 0)}
                count={`${stats?.zakatFitrah?.count || 0} muzakki berkah`}
                icon={<Heart className="w-6 h-6" />}
                color="teal"
              />
              
              <StatCard
                title="Zakat Mal"
                value={formatCurrency(stats?.zakatMal?.total || 0)}
                count={`${stats?.zakatMal?.count || 0} muzakki dermawan`}
                icon={<Wallet className="w-6 h-6" />}
                color="amber"
              />
            </div>
            
            {/* Kas Card - Larger */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="text-emerald-100 text-sm mb-2">Saldo Kas Masjid</p>
                <p className="text-3xl font-bold mb-1">{formatCurrency(stats?.currentSaldo || 0)}</p>
                <p className="text-emerald-200 text-sm">Amanah Umat</p>
              </div>
            </div>
          </div>
          
          {/* Secondary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard
              title="Total Pengeluaran"
              value={formatCurrency(stats?.pengeluaran?.total || 0)}
              count={`${stats?.pengeluaran?.count || 0} kegiatan masjid`}
              icon={<TrendingDown className="w-6 h-6" />}
              color="rose"
            />
            
            <StatCard
              title="Dana Tersalurkan"
              value={formatCurrency(stats?.distribusi?.total || 0)}
              count={`${stats?.distribusi?.count || 0} mustahiq terbantu`}
              icon={<Users className="w-6 h-6" />}
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Charts & Analytics */}
      <div className="px-2 sm:px-4 lg:px-6 mb-6 sm:mb-8 lg:mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/60 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-amber-600 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white">Analisis Keuangan</h3>
                  <p className="text-white/80 text-xs sm:text-sm">Grafik pemasukan dan pengeluaran bulanan</p>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              <DashboardCharts />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-2 sm:px-4 lg:px-6 mb-4 sm:mb-6 lg:mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/60 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white">Aktivitas Terbaru</h3>
                    <p className="text-white/80 text-xs sm:text-sm hidden sm:block">Transaksi dan kegiatan masjid hari ini</p>
                  </div>
                </div>
                <div className="text-white/60 text-xs hidden md:block">
                  Update terakhir: {new Date().toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              <RecentTransactions transactions={stats?.recentTransactions || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
