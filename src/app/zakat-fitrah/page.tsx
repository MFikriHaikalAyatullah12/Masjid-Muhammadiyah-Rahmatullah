'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '@/components/Modal';

interface ZakatFitrah {
  id: number;
  nama_muzakki: string;
  alamat_muzakki: string;
  no_telepon: string;
  jumlah_jiwa: number;
  jenis_bayar: string;
  jumlah_bayar: number;
  harga_per_kg: number;
  total_rupiah: number;
  tanggal_bayar: string;
  tahun_hijriah: string;
  status: string;
  keterangan: string;
}

export default function ZakatFitrahPage() {
  const [zakatList, setZakatList] = useState<ZakatFitrah[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama_muzakki: '',
    alamat_muzakki: '',
    no_telepon: '',
    jumlah_jiwa: 1,
    jenis_bayar: 'beras',
    jumlah_bayar: 2.5,
    harga_per_kg: 15000,
    tanggal_bayar: new Date().toISOString().split('T')[0],
    tahun_hijriah: '1446',
    keterangan: ''
  });

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    // Instant loading - no delay
    fetchZakatFitrah();
  }, []);

  const fetchZakatFitrah = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    }
    
    try {
      setError(null);
      
      // ULTRA-FAST fetch with minimal timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Extended for Neon
      
      const response = await fetch('/api/zakat-fitrah', {
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
      setZakatList(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Request timeout:', error);
        if (showLoadingIndicator) {
          setError('Koneksi lambat. Silakan coba lagi.');
        }
      } else {
        console.error('Error fetching zakat fitrah:', error);
        if (showLoadingIndicator) {
          setError('Gagal memuat data. Silakan coba lagi.');
          setZakatList([]);
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
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!formData.nama_muzakki.trim()) {
        throw new Error('Nama muzakki harus diisi');
      }
      if (formData.jumlah_jiwa < 1) {
        throw new Error('Jumlah jiwa minimal 1');
      }
      if (formData.jumlah_bayar <= 0) {
        throw new Error('Jumlah bayar harus lebih dari 0');
      }
      if (formData.jenis_bayar !== 'uang' && formData.harga_per_kg <= 0) {
        throw new Error('Harga per kg harus lebih dari 0');
      }
      
      const response = await fetch('/api/zakat-fitrah', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        cache: 'no-store'
      });

      const responseData = await response.json();
      
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Gagal menyimpan data');
      }

      // Optimistic update - add to list immediately
      const newZakat = responseData.data;
      if (newZakat) {
        setZakatList(prevList => [newZakat, ...prevList]);
      }
      
      setSuccess(responseData.message || 'Data zakat fitrah berhasil disimpan!');
      setShowForm(false);
      setFormData({
        nama_muzakki: '',
        alamat_muzakki: '',
        no_telepon: '',
        jumlah_jiwa: 1,
        jenis_bayar: 'beras',
        jumlah_bayar: 2.5,
        harga_per_kg: 15000,
        tanggal_bayar: new Date().toISOString().split('T')[0],
        tahun_hijriah: '1446',
        keterangan: ''
      });
      
      // Fetch fresh data in background to ensure consistency
      setTimeout(() => fetchZakatFitrah(false), 500);
    } catch (error: any) {
      console.error('Error creating zakat fitrah:', error);
      setError(error.message || 'Gagal menyimpan data zakat fitrah');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    const zakatToDelete = zakatList.find(zakat => zakat.id === deleteId);
    
    try {
      // Optimistic update - remove from UI immediately
      setZakatList(prevList => prevList.filter(zakat => zakat.id !== deleteId));
      
      setShowDeleteDialog(false);
      setDeleteId(null);
      
      const response = await fetch(`/api/zakat-fitrah/${deleteId}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      
      if (response.ok) {
        setSuccess('Data zakat fitrah berhasil dihapus!');
        // Fetch fresh data in background to ensure consistency
        setTimeout(() => fetchZakatFitrah(false), 500);
      } else {
        // Failed - revert optimistic updates
        if (zakatToDelete) {
          setZakatList(prevList => [zakatToDelete, ...prevList].sort((a, b) => 
            new Date(b.tanggal_bayar).getTime() - new Date(a.tanggal_bayar).getTime()
          ));
        }
        
        const errorData = await response.json();
        setError(`Error: ${errorData.error || 'Failed to delete zakat fitrah'}`);
      }
    } catch (error) {
      console.error('Error deleting zakat fitrah:', error);
      
      // Network error - revert optimistic updates
      if (zakatToDelete) {
        setZakatList(prevList => [zakatToDelete, ...prevList].sort((a, b) => 
          new Date(b.tanggal_bayar).getTime() - new Date(a.tanggal_bayar).getTime()
        ));
      }
      
      setError('Network error. Please try again.');
    }
  };

  const calculateTotal = () => {
    if (formData.jenis_bayar === 'uang') {
      return formData.jumlah_bayar * formData.jumlah_jiwa;
    } else {
      return formData.jumlah_bayar * formData.jumlah_jiwa * formData.harga_per_kg;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Alert Messages */}
      {(error || success) && (
        <div className={`p-4 rounded-lg border flex items-start gap-3 ${
          error 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          {error ? (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{error || success}</p>
          </div>
          <button
            onClick={() => { setError(null); setSuccess(null); }}
            className="text-current hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Zakat Fitrah</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600">Kelola penerimaan zakat fitrah</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base min-h-[48px] shadow-sm"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Tambah Zakat Fitrah
        </button>
      </div>

      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : zakatList.length === 0 ? (
          <div className="text-center py-8 text-gray-700">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-800">Belum ada data zakat fitrah</p>
            <p className="text-sm mt-1 text-gray-600">Klik tombol "Tambah Zakat Fitrah" untuk mulai menambah data</p>
          </div>
        ) : (
          zakatList.map((zakat) => (
            <div key={zakat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{zakat.nama_muzakki}</h3>
                  {zakat.no_telepon && (
                    <p className="text-sm text-gray-600">{zakat.no_telepon}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(zakat.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Jumlah Jiwa:</span>
                  <p className="font-medium">{zakat.jumlah_jiwa} jiwa</p>
                </div>
                <div>
                  <span className="text-gray-500">Jenis Bayar:</span>
                  <p className="font-medium">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {zakat.jenis_bayar}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Jumlah:</span>
                  <p className="font-medium">
                    {zakat.jenis_bayar === 'uang' ? formatCurrency(zakat.jumlah_bayar) : `${zakat.jumlah_bayar} kg`}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <p className="font-bold text-emerald-600">{formatCurrency(zakat.total_rupiah)}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Tanggal: {new Date(zakat.tanggal_bayar).toLocaleDateString('id-ID')}</span>
                  <span>Status: Aktif</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Muzakki
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jiwa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jenis Bayar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-600">Memuat data...</p>
                  </td>
                </tr>
              ) : zakatList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-700">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-800">Belum ada data zakat fitrah</p>
                    <p className="text-sm mt-1 text-gray-600">Klik tombol "Tambah Zakat Fitrah" untuk mulai menambah data</p>
                  </td>
                </tr>
              ) : (
                zakatList.map((zakat) => (
                  <tr key={zakat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{zakat.nama_muzakki}</div>
                        {zakat.no_telepon && <div className="text-sm text-gray-500">{zakat.no_telepon}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {zakat.jumlah_jiwa} jiwa
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {zakat.jenis_bayar}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {zakat.jenis_bayar === 'uang' ? formatCurrency(zakat.jumlah_bayar) : `${zakat.jumlah_bayar} kg`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                      {formatCurrency(zakat.total_rupiah)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(zakat.tanggal_bayar).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(zakat.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Zakat Fitrah Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Buat Zakat Fitrah"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Muzakki */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Nama Muzakki *
              </label>
              <input
                type="text"
                value={formData.nama_muzakki}
                onChange={(e) => setFormData({ ...formData, nama_muzakki: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
                placeholder="Masukkan nama muzakki"
                required
              />
            </div>

            {/* No. Telepon */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                No. Telepon
              </label>
              <input
                type="tel"
                value={formData.no_telepon}
                onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            {/* Jumlah Jiwa */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Jumlah Jiwa *
              </label>
              <input
                type="number"
                min="1"
                value={formData.jumlah_jiwa}
                onChange={(e) => setFormData({ ...formData, jumlah_jiwa: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
                required
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Alamat
            </label>
            <textarea
              value={formData.alamat_muzakki}
              onChange={(e) => setFormData({ ...formData, alamat_muzakki: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
              rows={3}
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jenis Bayar */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Jenis Bayar *
              </label>
              <select
                value={formData.jenis_bayar}
                onChange={(e) => {
                  const jenis = e.target.value;
                  setFormData({ 
                    ...formData, 
                    jenis_bayar: jenis,
                    jumlah_bayar: jenis === 'uang' ? 37500 : 2.5,
                    harga_per_kg: jenis === 'uang' ? 0 : 15000
                  });
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
                required
              >
                <option value="beras">🌾 Beras</option>
                <option value="gandum">🌾 Gandum</option>
                <option value="uang">💰 Uang</option>
              </select>
            </div>

            {/* Jumlah/Nilai */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {formData.jenis_bayar === 'uang' ? 'Nilai Uang (Rp)' : 'Jumlah (kg)'} *
              </label>
              <input
                type="number"
                min={formData.jenis_bayar === 'uang' ? "1000" : "0.1"}
                step={formData.jenis_bayar === 'uang' ? "1000" : "0.1"}
                value={formData.jumlah_bayar}
                onChange={(e) => setFormData({ ...formData, jumlah_bayar: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
                placeholder={formData.jenis_bayar === 'uang' ? '37500' : '2.5'}
                required
              />
            </div>
          </div>

          {formData.jenis_bayar !== 'uang' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Harga per Kg */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Harga per Kg (Rp) *
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={formData.harga_per_kg}
                  onChange={(e) => setFormData({ ...formData, harga_per_kg: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
                  placeholder="15000"
                  required
                />
              </div>
              
              {/* Total Preview */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Total Rupiah
                </label>
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-bold text-lg">
                  {formatCurrency(calculateTotal())}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tanggal Bayar */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Tanggal Bayar *
              </label>
              <input
                type="date"
                value={formData.tanggal_bayar}
                onChange={(e) => setFormData({ ...formData, tanggal_bayar: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
                required
              />
            </div>

            {/* Tahun Hijriah */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Tahun Hijriah *
              </label>
              <input
                type="text"
                value={formData.tahun_hijriah}
                onChange={(e) => setFormData({ ...formData, tahun_hijriah: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
                placeholder="1446"
                required
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Keterangan
            </label>
            <textarea
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-gray-800 bg-white"
              rows={3}
              placeholder="Keterangan tambahan (opsional)"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan Zakat Fitrah'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Konfirmasi Hapus
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus data zakat fitrah ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors font-medium min-h-[48px]"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium min-h-[48px]"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}