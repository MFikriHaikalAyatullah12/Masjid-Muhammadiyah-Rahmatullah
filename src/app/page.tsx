'use client';

import { useEffect, useState } from 'react';
import { Building, Heart, Wallet, TrendingUp, TrendingDown, Users } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RecentTransactions from '@/components/RecentTransactions';
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
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dashboard API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
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
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            {/* Logo Masjid */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Building className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
            </div>
            
            {/* Title and Description */}
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Masjid Muhammadiyah Rahmatullah
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Selamat datang di sistem manajemen zakat dan keuangan masjid
              </p>
            </div>
            
            {/* Decorative element */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard
          title="Total Zakat Fitrah"
          value={formatCurrency(stats?.zakatFitrah?.total || 0)}
          count={`${stats?.zakatFitrah?.count || 0} muzakki`}
          icon={<Heart className="w-5 h-5 md:w-6 md:h-6" />}
          color="emerald"
        />
        
        <StatCard
          title="Total Zakat Mal"
          value={formatCurrency(stats?.zakatMal?.total || 0)}
          count={`${stats?.zakatMal?.count || 0} muzakki`}
          icon={<Wallet className="w-5 h-5 md:w-6 md:h-6" />}
          color="blue"
        />
        
        <StatCard
          title="Saldo Kas Saat Ini"
          value={formatCurrency(stats?.currentSaldo || 0)}
          count="Kas Masjid"
          icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6" />}
          color="green"
        />
        
        <StatCard
          title="Total Pengeluaran"
          value={formatCurrency(stats?.pengeluaran?.total || 0)}
          count={`${stats?.pengeluaran?.count || 0} transaksi`}
          icon={<TrendingDown className="w-5 h-5 md:w-6 md:h-6" />}
          color="red"
        />
        
        <StatCard
          title="Total Distribusi"
          value={formatCurrency(stats?.distribusi?.total || 0)}
          count={`${stats?.distribusi?.count || 0} penerima`}
          icon={<Users className="w-5 h-5 md:w-6 md:h-6" />}
          color="purple"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 md:px-6 py-4 md:py-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Transaksi Terbaru</h2>
          <p className="text-sm text-gray-600 mt-1">Aktivitas keuangan terkini</p>
        </div>
        <div className="p-4 md:p-6">
          <RecentTransactions transactions={stats?.recentTransactions || []} />
        </div>
      </div>
    </div>
  );
}
