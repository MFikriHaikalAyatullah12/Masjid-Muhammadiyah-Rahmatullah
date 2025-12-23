'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
  monthlyStats: Array<{
    bulan: string;
    pemasukan: number;
    pengeluaran: number;
  }>;
  categoryStats: Array<{
    kategori: string;
    total: number;
    persentase: number;
  }>;
}

const COLORS = ['#059669', '#dc2626', '#ea580c', '#7c3aed', '#2563eb', '#9333ea'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K';
  }
  return value.toString();
};

export default function DashboardCharts() {
  const router = useRouter();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
    const interval = setInterval(fetchChartData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/charts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      const validatedData: ChartData = {
        monthlyStats: Array.isArray(data.monthlyStats) ? data.monthlyStats : [],
        categoryStats: Array.isArray(data.categoryStats) ? data.categoryStats : []
      };
      
      setChartData(validatedData);
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      setError(error.message || 'Gagal memuat data grafik');
      
      setChartData({
        monthlyStats: [],
        categoryStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-center text-center">
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Data Grafik</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchChartData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData || (!chartData.monthlyStats.length && !chartData.categoryStats.length)) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Data</h3>
            <p className="text-gray-600 mb-4">
              Mulai menambahkan transaksi untuk melihat grafik statistik keuangan
            </p>
            <button
              onClick={fetchChartData}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pemasukan vs Pengeluaran Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Pemasukan vs Pengeluaran</h2>
          <p className="text-sm text-gray-600 mt-1">Trend keuangan 6 bulan terakhir</p>
        </div>
        <div className="p-6">
          {chartData.monthlyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="bulan" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNumber}
                />
                <Tooltip 
                  formatter={(value: number | undefined) => [formatCurrency(value || 0), '']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: '14px', 
                    fontWeight: '500' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="pemasukan" 
                  stroke="#059669" 
                  strokeWidth={3}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Pemasukan"
                />
                <Line 
                  type="monotone" 
                  dataKey="pengeluaran" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Pengeluaran"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-sm">Belum ada data transaksi</p>
                <p className="text-xs mt-1">Tambahkan transaksi untuk melihat grafik</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kategori Pengeluaran Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Kategori Pengeluaran</h2>
          <p className="text-sm text-gray-600 mt-1">Distribusi pengeluaran 30 hari terakhir</p>
        </div>
        <div className="p-6">
          {chartData.categoryStats.length > 0 && chartData.categoryStats[0].kategori !== 'Tidak ada data' ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload }: any) => `${payload?.persentase || 0}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {chartData.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Total']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {chartData.categoryStats.slice(0, 6).map((item, index) => (
                  <div key={item.kategori} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700 font-medium">{item.kategori}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(item.total)}</div>
                      <div className="text-xs text-gray-500">{item.persentase}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-sm">Belum ada data pengeluaran</p>
                <p className="text-xs mt-1">Tambahkan pengeluaran untuk melihat distribusi</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}