'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import Loading from '@/components/Loading';

interface LaporanData {
  zakatFitrah: {
    total: number;
    count: number;
    beras: number;
    uang: number;
  };
  zakatMal: {
    total: number;
    count: number;
  };
  kasHarian: {
    pemasukan: number;
    pengeluaran: number;
    saldo: number;
  };
  distribusi: {
    total: number;
    count: number;
  };
}

export default function LaporanPage() {
  const [loading, setLoading] = useState(true);
  const [laporan, setLaporan] = useState<LaporanData | null>(null);
  const [periode, setPeriode] = useState({
    dari: new Date().getFullYear() + '-01-01',
    sampai: new Date().toISOString().split('T')[0]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/laporan?dari=${periode.dari}&sampai=${periode.sampai}`);
      if (response.ok) {
        const data = await response.json();
        setLaporan(data);
      }
    } catch (error) {
      console.error('Error fetching laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, [periode]);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/laporan/pdf?dari=${periode.dari}&sampai=${periode.sampai}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-zakat-${periode.dari}-${periode.sampai}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return <Loading text="Memuat laporan..." />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <FileText className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
              <p className="text-gray-600 text-sm">Laporan lengkap pengelolaan zakat dan kas masjid</p>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            <Download size={20} />
            <span className="font-medium">Download PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Periode */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Filter Periode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={periode.dari}
              onChange={(e) => setPeriode({ ...periode, dari: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={periode.sampai}
              onChange={(e) => setPeriode({ ...periode, sampai: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchLaporan}
              className="w-full bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-md font-medium"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {laporan && (
        <>
          {/* Ringkasan Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm border border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Zakat Fitrah</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(laporan.zakatFitrah.total)}</p>
                <p className="text-sm text-blue-600 mt-1">{laporan.zakatFitrah.count} transaksi</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl shadow-sm border border-emerald-200">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-emerald-500 rounded-xl shadow-md">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700 mb-1">Zakat Mal</p>
                <p className="text-2xl font-bold text-emerald-900">{formatCurrency(laporan.zakatMal.total)}</p>
                <p className="text-sm text-emerald-600 mt-1">{laporan.zakatMal.count} transaksi</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl shadow-sm border border-amber-200">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-amber-500 rounded-xl shadow-md">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Saldo Kas</p>
                <p className="text-2xl font-bold text-amber-900">{formatCurrency(laporan.kasHarian.saldo)}</p>
                <p className="text-sm text-amber-600 mt-1">Pemasukan - Pengeluaran</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-sm border border-purple-200">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-purple-500 rounded-xl shadow-md">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Total Distribusi</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(laporan.distribusi.total)}</p>
                <p className="text-sm text-purple-600 mt-1">{laporan.distribusi.count} penerima</p>
              </div>
            </div>
          </div>

          {/* Detail Laporan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zakat Fitrah Detail */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                Detail Zakat Fitrah
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Total Beras (kg):</span>
                  <span className="font-bold text-blue-600">{laporan.zakatFitrah.beras} kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Total Uang:</span>
                  <span className="font-bold text-blue-600">{formatCurrency(laporan.zakatFitrah.uang)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border-2 border-blue-200">
                  <span className="text-gray-800 font-semibold">Total Keseluruhan:</span>
                  <span className="font-bold text-xl text-blue-700">{formatCurrency(laporan.zakatFitrah.total)}</span>
                </div>
              </div>
            </div>

            {/* Kas Harian Detail */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                Detail Kas Harian
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Total Pemasukan:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(laporan.kasHarian.pemasukan)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Total Pengeluaran:</span>
                  <span className="font-bold text-red-600">{formatCurrency(laporan.kasHarian.pengeluaran)}</span>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-xl border-2 ${
                  laporan.kasHarian.saldo >= 0 
                    ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 border-emerald-200' 
                    : 'bg-gradient-to-r from-red-100 to-red-50 border-red-200'
                }`}>
                  <span className="text-gray-800 font-semibold">Saldo Akhir:</span>
                  <span className={`font-bold text-xl ${laporan.kasHarian.saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatCurrency(laporan.kasHarian.saldo)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
