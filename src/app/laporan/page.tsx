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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Laporan Zakat</h1>
              <p className="text-gray-600">Laporan lengkap pengelolaan zakat dan kas masjid</p>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Periode */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Periode</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={periode.dari}
              onChange={(e) => setPeriode({ ...periode, dari: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={periode.sampai}
              onChange={(e) => setPeriode({ ...periode, sampai: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchLaporan}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {laporan && (
        <>
          {/* Ringkasan Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Zakat Fitrah</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(laporan.zakatFitrah.total)}</p>
                  <p className="text-sm text-gray-500">{laporan.zakatFitrah.count} transaksi</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Zakat Mal</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(laporan.zakatMal.total)}</p>
                  <p className="text-sm text-gray-500">{laporan.zakatMal.count} transaksi</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Kas</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(laporan.kasHarian.saldo)}</p>
                  <p className="text-sm text-gray-500">Pemasukan - Pengeluaran</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Distribusi</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(laporan.distribusi.total)}</p>
                  <p className="text-sm text-gray-500">{laporan.distribusi.count} penerima</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Detail Laporan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zakat Fitrah Detail */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Zakat Fitrah</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Beras (kg):</span>
                  <span className="font-medium">{laporan.zakatFitrah.beras} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Uang:</span>
                  <span className="font-medium">{formatCurrency(laporan.zakatFitrah.uang)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total Keseluruhan:</span>
                  <span className="font-bold">{formatCurrency(laporan.zakatFitrah.total)}</span>
                </div>
              </div>
            </div>

            {/* Kas Harian Detail */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Kas Harian</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pemasukan:</span>
                  <span className="font-medium text-green-600">{formatCurrency(laporan.kasHarian.pemasukan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pengeluaran:</span>
                  <span className="font-medium text-red-600">{formatCurrency(laporan.kasHarian.pengeluaran)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Saldo Akhir:</span>
                  <span className={`font-bold ${laporan.kasHarian.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
