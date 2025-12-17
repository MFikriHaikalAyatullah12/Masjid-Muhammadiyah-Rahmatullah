'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus, Trash2 } from 'lucide-react';

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
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
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
    fetchZakatFitrah();
  }, []);

  const fetchZakatFitrah = async () => {
    try {
      const response = await fetch('/api/zakat-fitrah');
      if (!response.ok) {
        throw new Error('Failed to fetch zakat fitrah');
      }
      const data = await response.json();
      setZakatList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching zakat fitrah:', error);
      setZakatList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/zakat-fitrah', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchZakatFitrah();
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
      }
    } catch (error) {
      console.error('Error creating zakat fitrah:', error);
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
    
    try {
      const response = await fetch(`/api/zakat-fitrah/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchZakatFitrah();
        setShowDeleteDialog(false);
        setDeleteId(null);
      } else {
        console.error('Failed to delete zakat fitrah');
      }
    } catch (error) {
      console.error('Error deleting zakat fitrah:', error);
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
    <div className="space-y-6 md:space-y-8">
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
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm md:text-base min-h-[44px]"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Tambah Zakat Fitrah
        </button>
      </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Tambah Zakat Fitrah</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Muzakki *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nama_muzakki}
                        onChange={(e) => setFormData({...formData, nama_muzakki: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        value={formData.no_telepon}
                        onChange={(e) => setFormData({...formData, no_telepon: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <textarea
                      value={formData.alamat_muzakki}
                      onChange={(e) => setFormData({...formData, alamat_muzakki: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Jiwa *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.jumlah_jiwa || ''}
                        onChange={(e) => setFormData({...formData, jumlah_jiwa: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Bayar *
                      </label>
                      <select
                        value={formData.jenis_bayar}
                        onChange={(e) => setFormData({...formData, jenis_bayar: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      >
                        <option value="beras">Beras</option>
                        <option value="gandum">Gandum</option>
                        <option value="uang">Uang</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.jenis_bayar === 'uang' ? 'Jumlah (Rp)' : 'Jumlah (Kg)'} *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={formData.jumlah_bayar || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setFormData({...formData, jumlah_bayar: value >= 0 ? value : 0});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      />
                    </div>
                  </div>

                  {formData.jenis_bayar !== 'uang' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga per Kg (Rp) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formData.harga_per_kg || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setFormData({...formData, harga_per_kg: value >= 0 ? value : 0});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Rupiah
                        </label>
                        <input
                          type="text"
                          value={formatCurrency(calculateTotal())}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Bayar *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.tanggal_bayar}
                        onChange={(e) => setFormData({...formData, tanggal_bayar: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun Hijriah *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.tahun_hijriah}
                        onChange={(e) => setFormData({...formData, tahun_hijriah: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan
                    </label>
                    <textarea
                      value={formData.keterangan}
                      onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
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
                  Muzakki
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jiwa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Bayar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              ) : zakatList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Belum ada data zakat fitrah
                  </td>
                </tr>
              ) : (
                zakatList.map((zakat) => (
                  <tr key={zakat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{zakat.nama_muzakki}</div>
                        {zakat.no_telepon && <div className="text-sm text-gray-500">{zakat.no_telepon}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {zakat.jumlah_jiwa} jiwa
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {zakat.jenis_bayar}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {zakat.jenis_bayar === 'uang' ? formatCurrency(zakat.jumlah_bayar) : `${zakat.jumlah_bayar} kg`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      {formatCurrency(zakat.total_rupiah)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        zakat.status === 'diterima' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {zakat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(zakat.id)}
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
        ) : zakatList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada data zakat fitrah
          </div>
        ) : (
          zakatList.map((zakat) => (
            <div key={zakat.id} className="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm border border-emerald-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{zakat.nama_muzakki}</h3>
                  {zakat.no_telepon && <p className="text-xs text-gray-500 mt-1">{zakat.no_telepon}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {zakat.jenis_bayar}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      zakat.status === 'diterima' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {zakat.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(zakat.id)}
                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                  title="Hapus data"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Jiwa:</span>
                  <p className="text-gray-900 font-medium">{zakat.jumlah_jiwa} jiwa</p>
                </div>
                <div>
                  <span className="font-medium">Jumlah:</span>
                  <p className="text-gray-900 font-medium">
                    {zakat.jenis_bayar === 'uang' ? formatCurrency(zakat.jumlah_bayar) : `${zakat.jumlah_bayar} kg`}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Total:</span>
                  <p className="text-emerald-600 font-medium">{formatCurrency(zakat.total_rupiah)}</p>
                </div>
                <div>
                  <span className="font-medium">Tanggal:</span>
                  <p className="text-gray-900 font-medium">{new Date(zakat.tanggal_bayar).toLocaleDateString('id-ID')}</p>
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
              Apakah Anda yakin ingin menghapus data zakat fitrah ini? Tindakan ini tidak dapat dibatalkan.
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