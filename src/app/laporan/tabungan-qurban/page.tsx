'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Download, Calendar, Users, TrendingUp, Banknote, FileDown } from 'lucide-react';
import LoadingEnhanced from '@/components/LoadingEnhanced';

interface TabunganSummary {
  totalPenabung: number;
  totalTransaksi: number;
  totalSetor: number;
  totalTarik: number;
  totalSaldo: number;
}

interface TabunganDetail {
  namaPenabung: string;
  alamat: string;
  jumlahSetor: number;
  jumlahTarik: number;
  saldoAkhir: number;
  tanggalSetor: string;
  keterangan: string;
}

interface PenabungSummary {
  namaPenabung: string;
  alamat: string;
  jumlahTransaksi: number;
  totalSetor: number;
  totalTarik: number;
  saldoTerakhir: number;
  tanggalPertama: string;
  tanggalTerakhir: string;
}

interface TabunganData {
  periode: {
    dari: string;
    sampai: string;
  };
  summary: TabunganSummary;
  detail: TabunganDetail[];
  penabung: PenabungSummary[];
}

export default function LaporanTabunganQurban() {
  const [data, setData] = useState<TabunganData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    // Auto-refresh setiap 30 detik untuk data realtime
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/laporan/tabungan-qurban', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const params = new URLSearchParams({ jenis: 'tabungan-qurban' });
    window.open(`/api/laporan/pdf?${params.toString()}`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: localeId });
  };

  if (loading) return <LoadingEnhanced />;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 lg:p-6 border border-emerald-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">📈 Laporan Tabungan Qurban</h1>
            <p className="text-sm lg:text-base text-gray-600">Laporan lengkap semua data tabungan qurban saat ini</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-xs lg:text-sm text-emerald-600 font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Data Realtime
            </span>
            <button
              onClick={downloadPDF}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 text-sm lg:text-base min-h-[44px]"
              disabled={loading}
            >
              <FileDown className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Penabung</h3>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{data.summary.totalPenabung}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Transaksi</h3>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{data.summary.totalTransaksi}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <Banknote className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Setoran</h3>
                  <p className="text-sm lg:text-xl font-bold text-green-600">{formatCurrency(data.summary.totalSetor)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-emerald-100 rounded-lg flex-shrink-0">
                  <Banknote className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Saldo</h3>
                  <p className="text-sm lg:text-xl font-bold text-emerald-600">{formatCurrency(data.summary.totalSaldo)}</p>
                </div>
              </div>
            </div>
          </div>



          {/* Data per Penabung */}
          {data.penabung.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Ringkasan Per Penabung</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Penabung</th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                      <th className="px-3 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi</th>
                      <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Setor</th>
                      <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tarik</th>
                      <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.penabung.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 lg:px-6 py-4 text-sm font-medium text-gray-900">
                          {item.namaPenabung}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-gray-600">
                          {item.alamat || '-'}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-center text-gray-900">
                          {item.jumlahTransaksi}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-right text-green-600 font-medium">
                          {formatCurrency(item.totalSetor)}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-right text-red-600 font-medium">
                          {formatCurrency(item.totalTarik)}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-right text-emerald-600 font-bold">
                          {formatCurrency(item.saldoTerakhir)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detail Transaksi */}
          {data.detail.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Detail Transaksi</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                      <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                      <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tarik</th>
                      <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.detail.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                          {formatDate(item.tanggalSetor)}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm font-medium text-gray-900">
                          {item.namaPenabung}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-gray-600">
                          {item.alamat || '-'}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-right text-green-600 font-medium">
                          {item.jumlahSetor > 0 ? formatCurrency(item.jumlahSetor) : '-'}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-right text-red-600 font-medium">
                          {item.jumlahTarik > 0 ? formatCurrency(item.jumlahTarik) : '-'}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-right text-emerald-600 font-bold">
                          {formatCurrency(item.saldoAkhir)}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm text-gray-600">
                          {item.keterangan || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.detail.length === 0 && (
            <div className="bg-emerald-50 rounded-xl p-8 lg:p-12 text-center border border-emerald-200">
              <p className="text-base lg:text-lg text-emerald-800 font-medium mb-2">Belum ada data transaksi</p>
              <p className="text-sm lg:text-base text-emerald-600">Data akan tampil otomatis saat ada transaksi baru di tabungan qurban</p>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8 lg:py-12">
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-emerald-200">
            <div className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin gpu-accelerated" style={{ animationDuration: '0.6s' }}></div>
            <span className="text-sm lg:text-base text-emerald-700 font-medium">Memuat data realtime...</span>
          </div>
        </div>
      )}
    </div>
  );
}