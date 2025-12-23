'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

interface Tabungan {
  id: number;
  nama_penabung: string;
  alamat: string;
  no_telepon: string;
  email: string;
  jenis_hewan: string;
  target_tabungan: number;
  total_terkumpul: number;
  sisa_kekurangan: number;
  tanggal_mulai: string;
  target_qurban_tahun: number;
  status: string;
  keterangan: string;
  jumlah_cicilan: number;
  persentase_terkumpul: number;
}

interface TabunganChartsProps {
  tabunganData?: Tabungan[];
}

const formatCurrency = (value: number) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function TabunganCharts({ tabunganData = [] }: TabunganChartsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tabunganData && tabunganData.length > 0) {
      generateStats(tabunganData);
    } else {
      fetchStats();
    }
  }, [tabunganData]);

  const generateStats = (data: Tabungan[]) => {
    try {
      setLoading(true);
      
      const totalTabungan = data.length;
      const totalTerkumpul = data.reduce((sum, t) => sum + (Number(t.total_terkumpul) || 0), 0);
      const targetTotal = data.reduce((sum, t) => sum + (Number(t.target_tabungan) || 0), 0);
      const tabunganAktif = data.filter(t => t.status === 'menabung').length;
      
      const statusCounts = data.reduce((acc, item) => {
        const status = item.status || 'tidak_diketahui';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: totalTabungan > 0 ? Math.round((count / totalTabungan) * 100) : 0
      }));
      
      const progressData = data
        .map(item => ({
          nama: item.nama_penabung || 'Tidak diketahui',
          persentase: Math.min(item.persentase_terkumpul || 0, 100),
          terkumpul: Number(item.total_terkumpul) || 0,
          target: Number(item.target_tabungan) || 0
        }))
        .sort((a, b) => b.persentase - a.persentase)
        .slice(0, 5);
      
      setStats({
        totalTabungan,
        totalTerkumpul,
        targetTotal,
        tabunganAktif,
        statusDistribution,
        progressData
      });
    } catch (error) {
      console.error('Error generating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tabungan-qurban/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Tabungan Aktif</p>
            <p className="text-xl font-bold text-gray-900">{stats.tabunganAktif || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Terkumpul</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalTerkumpul || 0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Target Total</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.targetTotal || 0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Progress Rata-rata</p>
            <p className="text-xl font-bold text-green-600">
              {stats.targetTotal > 0 ? Math.round((stats.totalTerkumpul / stats.targetTotal) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Status Tabungan</h2>
            <p className="text-sm text-gray-600 mt-1">Distribusi status penabung</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload }: any) => `${payload?.percentage || 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(stats.statusDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value || 0} penabung`, 'Jumlah']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {(stats.statusDistribution || []).map((item: any, index: number) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Progress Penabung</h2>
            <p className="text-sm text-gray-600 mt-1">Top 5 penabung dengan progress terbesar</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.progressData || []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis 
                  dataKey="nama" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value || 0}%`, 'Progress']}
                  labelFormatter={(label) => `Penabung: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="persentase" 
                  fill="#10b981" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}