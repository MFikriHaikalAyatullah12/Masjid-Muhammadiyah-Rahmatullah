'use client';

import { useState, useEffect } from 'react';
import { Banknote, Plus, Download, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

interface KasHarian {
  id: number;
  tanggal: string;
  jenis_transaksi: string;
  kategori: string;
  deskripsi: string;
  jumlah: number;
  saldo_sebelum: number;
  saldo_sesudah: number;
  petugas: string;
  bukti_transaksi: string;
  created_at: string;
}

export default function KasHarianPage() {
  const [kasList, setKasList] = useState<KasHarian[]>([]);
  const [currentSaldo, setCurrentSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jenis_transaksi: 'masuk',
    kategori: 'infaq',
    deskripsi: '',
    jumlah: 0,
    petugas: 'Admin'
  });

  const kategoriOptions = {
    masuk: [
      'zakat_fitrah',
      'zakat_mal', 
      'infaq',
      'sedekah',
      'donasi',
      'sumbangan',
      'lainnya'
    ],
    keluar: [
      'distribusi_zakat',
      'operasional',
      'listrik',
      'air',
      'keamanan',
      'kebersihan',
      'perbaikan',
      'program_masjid',
      'lainnya'
    ]
  };

  useEffect(() => {
    fetchKasHarian();
  }, []);

  const fetchKasHarian = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    }
    
    try {
      // Ultra-fast fetch with minimal timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 detik timeout

      const response = await fetch('/api/kas-harian', {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, max-age=0',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setKasList(Array.isArray(data.data) ? data.data : []);
      const saldo = parseFloat(data.currentSaldo?.toString()) || 0;
      setCurrentSaldo(isNaN(saldo) ? 0 : saldo);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Request timeout:', error);
        if (showLoadingIndicator) {
          alert('Koneksi lambat. Silakan coba lagi.');
        }
      } else {
        console.error('Error fetching kas harian:', error);
        if (showLoadingIndicator) {
          alert('Gagal memuat data. Silakan coba lagi.');
          setKasList([]);
          setCurrentSaldo(0);
        }
      }
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show immediate feedback
    const tempId = Date.now();
    const tempKas = {
      id: tempId,
      ...formData,
      saldo_sebelum: currentSaldo,
      saldo_sesudah: formData.jenis_transaksi === 'masuk' 
        ? currentSaldo + formData.jumlah 
        : currentSaldo - formData.jumlah,
      created_at: new Date().toISOString()
    };
    
    // INSTANT UI UPDATE
    setKasList(prevList => [tempKas as any, ...prevList]);
    setCurrentSaldo(tempKas.saldo_sesudah);
    setShowForm(false);
    resetForm();
    
    try {
      const response = await fetch('/api/kas-harian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        cache: 'no-store'
      });

      if (response.ok) {
        // Replace temp data with real data
        const newKas = await response.json();
        setKasList(prevList => 
          prevList.map(kas => kas.id === tempId ? newKas : kas)
        );
      } else {
        // Revert on error
        setKasList(prevList => prevList.filter(kas => kas.id !== tempId));
        if (formData.jenis_transaksi === 'masuk') {
          setCurrentSaldo(prev => prev - formData.jumlah);
        } else {
          setCurrentSaldo(prev => prev + formData.jumlah);
        }
        
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to create transaction'}`);
      }
    } catch (error) {
      // Revert on network error
      setKasList(prevList => prevList.filter(kas => kas.id !== tempId));
      if (formData.jenis_transaksi === 'masuk') {
        setCurrentSaldo(prev => prev - formData.jumlah);
      } else {
        setCurrentSaldo(prev => prev + formData.jumlah);
      }
      
      console.error('Error creating kas harian:', error);
      alert('Network error. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      jenis_transaksi: 'masuk',
      kategori: 'infaq',
      deskripsi: '',
      jumlah: 0,
      petugas: 'Admin'
    });
  };

  const formatCurrency = (amount: number) => {
    const value = isNaN(amount) ? 0 : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    setLoading(true);
    const kasToDelete = kasList.find(kas => kas.id === deleteId);
    
    try {
      // Optimistic update - remove from UI immediately
      setKasList(prevList => prevList.filter(kas => kas.id !== deleteId));
      
      // Update saldo immediately
      if (kasToDelete) {
        if (kasToDelete.jenis_transaksi === 'masuk') {
          setCurrentSaldo(prev => prev - kasToDelete.jumlah);
        } else {
          setCurrentSaldo(prev => prev + kasToDelete.jumlah);
        }
      }
      
      setShowDeleteDialog(false);
      setDeleteId(null);
      
      const response = await fetch(`/api/kas-harian/${deleteId}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      
      if (response.ok) {
        // Success - fetch fresh data to ensure consistency
        setTimeout(() => fetchKasHarian(), 500);
      } else {
        // Failed - revert optimistic updates
        if (kasToDelete) {
          setKasList(prevList => [kasToDelete, ...prevList].sort((a, b) => 
            new Date(b.tanggal + ' ' + b.created_at).getTime() - 
            new Date(a.tanggal + ' ' + a.created_at).getTime()
          ));
          
          if (kasToDelete.jenis_transaksi === 'masuk') {
            setCurrentSaldo(prev => prev + kasToDelete.jumlah);
          } else {
            setCurrentSaldo(prev => prev - kasToDelete.jumlah);
          }
        }
        
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete transaction'}`);
      }
    } catch (error) {
      console.error('Error deleting kas harian:', error);
      
      // Network error - revert optimistic updates
      if (kasToDelete) {
        setKasList(prevList => [kasToDelete, ...prevList].sort((a, b) => 
          new Date(b.tanggal + ' ' + b.created_at).getTime() - 
          new Date(a.tanggal + ' ' + a.created_at).getTime()
        ));
        
        if (kasToDelete.jenis_transaksi === 'masuk') {
          setCurrentSaldo(prev => prev + kasToDelete.jumlah);
        } else {
          setCurrentSaldo(prev => prev - kasToDelete.jumlah);
        }
      }
      
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalMasuk = () => {
    const total = kasList
      .filter(kas => kas.jenis_transaksi === 'masuk')
      .reduce((total, kas) => total + (parseFloat(kas.jumlah?.toString()) || 0), 0);
    return isNaN(total) ? 0 : total;
  };

  const getTotalKeluar = () => {
    const total = kasList
      .filter(kas => kas.jenis_transaksi === 'keluar')
      .reduce((total, kas) => total + (parseFloat(kas.jumlah?.toString()) || 0), 0);
    return isNaN(total) ? 0 : total;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <Banknote className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kas Harian</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600">Kelola pemasukan dan pengeluaran kas harian</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm md:text-base min-h-[44px]">
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            Export
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm md:text-base min-h-[44px]"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm border border-emerald-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Banknote className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Saldo Saat Ini</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{formatCurrency(currentSaldo)}</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm border border-emerald-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Total Pemasukan</p>
            <p className="text-lg md:text-2xl font-bold text-blue-600">{formatCurrency(getTotalMasuk())}</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm border border-emerald-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Banknote className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Net Flow</p>
            <p className={`text-lg md:text-2xl font-bold ${getTotalMasuk() - getTotalKeluar() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(getTotalMasuk() - getTotalKeluar())}
            </p>
          </div>
        </div>
      </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold text-gray-900">Tambah Transaksi Kas</h2>
                </div>
                
                <form id="kasForm" onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal}
                      onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Transaksi *
                    </label>
                    <select
                      value={formData.jenis_transaksi}
                      onChange={(e) => setFormData({
                        ...formData, 
                        jenis_transaksi: e.target.value,
                        kategori: kategoriOptions[e.target.value as keyof typeof kategoriOptions][0]
                      })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                    >
                      <option value="masuk">Pemasukan</option>
                      <option value="keluar">Pengeluaran</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                    >
                      {kategoriOptions[formData.jenis_transaksi as keyof typeof kategoriOptions].map(kategori => (
                        <option key={kategori} value={kategori}>
                          {kategori.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi *
                    </label>
                    <textarea
                      required
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors resize-none"
                      rows={3}
                      placeholder="Deskripsi transaksi..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah (Rp) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.jumlah || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setFormData({...formData, jumlah: value >= 0 ? value : 0});
                      }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Petugas *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.petugas}
                      onChange={(e) => setFormData({...formData, petugas: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                      placeholder="Nama petugas"
                    />
                  </div>

                  {/* Preview */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-600 mb-1">Saldo setelah transaksi:</div>
                    <div className={`text-xl font-bold ${
                      formData.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.jenis_transaksi === 'masuk' 
                        ? formatCurrency(currentSaldo + formData.jumlah)
                        : formatCurrency(currentSaldo - formData.jumlah)
                      }
                    </div>
                  </div>
                </form>

                <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-200 px-6 py-4 rounded-b-xl">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      form="kasForm"
                      onClick={handleSubmit}
                      className="px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Simpan Transaksi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Table - Desktop View */}
      <div className="hidden md:block bg-white/60 backdrop-blur-sm rounded-lg shadow-sm border border-emerald-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : kasList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Belum ada transaksi kas
                  </td>
                </tr>
              ) : (
                kasList.map((kas) => (
                  <tr key={kas.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(kas.tanggal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        kas.jenis_transaksi === 'masuk' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {kas.jenis_transaksi === 'masuk' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {kas.jenis_transaksi}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {kas.kategori.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{kas.deskripsi}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={kas.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                        {kas.jenis_transaksi === 'masuk' ? '+' : '-'}{formatCurrency(kas.jumlah)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(kas.saldo_sesudah)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(kas.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Hapus data"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Memuat data...
          </div>
        ) : kasList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada transaksi kas
          </div>
        ) : (
          kasList.map((kas) => (
            <div key={kas.id} className="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm border border-emerald-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      kas.jenis_transaksi === 'masuk' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {kas.jenis_transaksi === 'masuk' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {kas.jenis_transaksi}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {kas.kategori.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{kas.deskripsi}</p>
                  <p className="text-xs text-gray-500">{kas.petugas} • {formatDate(kas.tanggal)}</p>
                </div>
                <button
                  onClick={() => handleDelete(kas.id)}
                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                  title="Hapus data"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Jumlah:</span>
                  <p className={`font-medium ${kas.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>
                    {kas.jenis_transaksi === 'masuk' ? '+' : '-'}{formatCurrency(kas.jumlah)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Saldo:</span>
                  <p className="text-gray-900 font-medium">{formatCurrency(kas.saldo_sesudah)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus transaksi kas ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
