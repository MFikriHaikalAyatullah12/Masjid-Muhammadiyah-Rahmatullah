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
  incomeStats: Array<{
    kategori: string;
    total: number;
    persentase: number;
  }>;
}

const COLORS_INCOME = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
const COLORS_EXPENSE = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];

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
    // Debounce untuk menghindari multiple calls
    const timer = setTimeout(() => {
      fetchChartData();
    }, 100);
    
    // Auto refresh setiap 5 menit (bukan 30 detik)
    const interval = setInterval(fetchChartData, 300000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const fetchChartData = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/charts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      const validatedData: ChartData = {
        monthlyStats: Array.isArray(data.monthlyStats) ? data.monthlyStats : [],
        categoryStats: Array.isArray(data.categoryStats) ? data.categoryStats : [],
        incomeStats: Array.isArray(data.incomeStats) ? data.incomeStats : []
      };
      
      setChartData(validatedData);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        setError('Request timeout - Please try again');
      } else {
        console.error('Error fetching chart data:', error);
        const errorMessage = error.message || 'Gagal memuat data grafik';
        setError(errorMessage);
      }
      
      setChartData({
        monthlyStats: [],
        categoryStats: [],
        incomeStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-red-50 border border-red-200 rounded-xl p-6">
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

  if (!chartData || (!chartData.monthlyStats.length && !chartData.categoryStats.length && !chartData.incomeStats.length)) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-gray-50 border border-gray-200 rounded-xl p-12">
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pemasukan vs Pengeluaran Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Pemasukan vs Pengeluaran</h2>
          <p className="text-sm text-gray-600 mt-1">Trend keuangan 3 bulan terakhir</p>
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

      {/* Distribusi Pemasukan Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-emerald-50">
          <h2 className="text-lg font-semibold text-emerald-900">Distribusi Pemasukan</h2>
          <p className="text-sm text-emerald-700 mt-1">Sumber dana masuk periode terakhir</p>
        </div>
        <div className="p-6">
          {chartData.incomeStats.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData.incomeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload, percent, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
                      if (payload && (payload.persentase >= 5 || chartData.incomeStats.length <= 2)) {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="white" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            fontSize={12}
                            fontWeight="600"
                            stroke="rgba(0,0,0,0.8)"
                            strokeWidth={0.5}
                          >
                            {payload.persentase}%
                          </text>
                        );
                      }
                      return null;
                    }}
                    outerRadius={75}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {chartData.incomeStats.map((entry, index) => (
                      <Cell key={`income-${index}`} fill={COLORS_INCOME[index % COLORS_INCOME.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number | undefined, name: any, props: any) => [
                      formatCurrency(value || 0),
                      `${props.payload?.kategori} (${props.payload?.persentase}%)`
                    ]}
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
                {chartData.incomeStats.slice(0, 4).map((item, index) => (
                  <div key={item.kategori} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS_INCOME[index % COLORS_INCOME.length] }}
                      />
                      <span className="text-gray-700 font-medium text-xs">{item.kategori}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 text-xs">{formatCurrency(item.total)}</div>
                      <div className="text-xs text-gray-500">{item.persentase}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-sm">Belum ada data pemasukan</p>
                <p className="text-xs mt-1">Tambahkan pemasukan untuk melihat distribusi</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kategori Pengeluaran Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900">Kategori Pengeluaran</h2>
          <p className="text-sm text-red-700 mt-1">Distribusi pengeluaran periode terakhir</p>
        </div>
        <div className="p-6">
          {chartData.categoryStats.length > 0 && chartData.categoryStats[0].kategori !== 'Tidak ada data' ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData.categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload, percent, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
                      if (payload && (payload.persentase >= 5 || chartData.categoryStats.length <= 2)) {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="white" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            fontSize={12}
                            fontWeight="600"
                            stroke="rgba(0,0,0,0.8)"
                            strokeWidth={0.5}
                          >
                            {payload.persentase}%
                          </text>
                        );
                      }
                      return null;
                    }}
                    outerRadius={75}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {chartData.categoryStats.map((entry, index) => (
                      <Cell key={`expense-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number | undefined, name: any, props: any) => [
                      formatCurrency(value || 0),
                      `${props.payload?.kategori} (${props.payload?.persentase}%)`
                    ]}
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
                {chartData.categoryStats.slice(0, 4).map((item, index) => (
                  <div key={item.kategori} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS_EXPENSE[index % COLORS_EXPENSE.length] }}
                      />
                      <span className="text-gray-700 font-medium text-xs">{item.kategori}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 text-xs">{formatCurrency(item.total)}</div>
                      <div className="text-xs text-gray-500">{item.persentase}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
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