'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

interface TabunganStats {
  totalTabungan: number;
  totalTerkumpul: number;
  targetTotal: number;
  tabunganAktif: number;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  progressData: Array<{
    nama: string;
    persentase: number;
    terkumpul: number;
    target: number;
  }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

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

export default function TabunganCharts() {
  const [chartData, setChartData] = useState<TabunganStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
    // Update every minute
    const interval = setInterval(fetchChartData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tabungan-qurban/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching tabungan chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !chartData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loading placeholders */}
        <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-300 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-slate-300 rounded"></div>
          </div>
        </div>
        <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-300 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-slate-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Tabungan Aktif</p>
            <p className="text-xl font-bold text-gray-900">{chartData.tabunganAktif}</p>
          </div>
        </div>

        <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Terkumpul</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(chartData.totalTerkumpul)}</p>
          </div>
        </div>

        <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Target Total</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(chartData.targetTotal)}</p>
          </div>
        </div>

        <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Progress Rata-rata</p>
            <p className="text-xl font-bold text-green-600">
              {chartData.targetTotal > 0 ? Math.round((chartData.totalTerkumpul / chartData.targetTotal) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60">
          <div className="px-6 py-4 border-b border-slate-200/60">
            <h2 className="text-lg font-semibold text-gray-900">Status Tabungan</h2>
            <p className="text-sm text-gray-600 mt-1">Distribusi status penabung</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload }: any) => `${payload?.percentage || 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number | undefined, name: string | undefined) => [`${value || 0} penabung`, 'Jumlah']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #d1fae5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-1 gap-2">
              {chartData.statusDistribution.map((item, index) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.status}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar Chart */}
        <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60">
          <div className="px-6 py-4 border-b border-slate-200/60">
            <h2 className="text-lg font-semibold text-gray-900">Progress Penabung</h2>
            <p className="text-sm text-gray-600 mt-1">Top 5 penabung dengan progress terbesar</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.progressData.slice(0, 5)} layout="horizontal">
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
                  formatter={(value: number | undefined) => [`${value || 0}%`, 'Progress']}
                  labelFormatter={(label) => `Penabung: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #d1fae5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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