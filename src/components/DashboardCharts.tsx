'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

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
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
    // Setup interval for real-time updates every 30 seconds
    const interval = setInterval(fetchChartData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/charts');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pemasukan vs Pengeluaran Chart */}
      <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60">
        <div className="px-6 py-4 border-b border-slate-200/60">
          <h2 className="text-lg font-semibold text-gray-900">Pemasukan vs Pengeluaran (6 Bulan)</h2>
          <p className="text-sm text-gray-600 mt-1">Trend keuangan bulanan</p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="bulan" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickFormatter={formatNumber}
              />
              <Tooltip 
                formatter={(value: number | undefined) => [formatCurrency(value || 0), '']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #d1fae5',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="pemasukan" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#059669', strokeWidth: 2, fill: '#ffffff' }}
                name="Pemasukan"
              />
              <Line 
                type="monotone" 
                dataKey="pengeluaran" 
                stroke="#dc2626" 
                strokeWidth={3}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#dc2626', strokeWidth: 2, fill: '#ffffff' }}
                name="Pengeluaran"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kategori Terbesar Pie Chart */}
      <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/60">
        <div className="px-6 py-4 border-b border-slate-200/60">
          <h2 className="text-lg font-semibold text-gray-900">Kategori Terbesar</h2>
          <p className="text-sm text-gray-600 mt-1">Distribusi pengeluaran per kategori</p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.categoryStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ payload }: any) => `${payload?.persentase || 0}%`}
                outerRadius={100}
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
            {chartData.categoryStats.map((item, index) => (
              <div key={item.kategori} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {item.kategori}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {item.persentase}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}