'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, Plus, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

interface Pengeluaran {
  id: number;
  tanggal: string;
  kategori: string;
  sub_kategori: string;
  deskripsi: string;
  penerima: string;
  jumlah: number;
  metode_pembayaran: string;
  bukti_pembayaran: string;
  disetujui_oleh: string;
  status: string;
  keterangan: string;
  created_at: string;
}

export default function PengeluaranPage() {
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [approveId, setApproveId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'distribusi_zakat',
    sub_kategori: '',
    deskripsi: '',
    penerima: '',
    jumlah: 0,
    metode_pembayaran: 'tunai',
    keterangan: ''
  });

  const kategoriOptions = [
    { value: 'distribusi_zakat', label: 'Distribusi Zakat', subkategori: ['fakir', 'miskin', 'amil', 'muallaf', 'riqab', 'gharim', 'fisabilillah', 'ibnu_sabil'] },
    { value: 'operasional', label: 'Operasional', subkategori: ['listrik', 'air', 'telepon', 'internet', 'keamanan', 'kebersihan'] },
    { value: 'program_masjid', label: 'Program Masjid', subkategori: ['kajian', 'santunan', 'beasiswa', 'pembangunan', 'renovasi'] },
    { value: 'administrasi', label: 'Administrasi', subkategori: ['alat_tulis', 'fotokopi', 'surat_menyurat', 'dokumen'] },
    { value: 'konsumsi', label: 'Konsumsi', subkategori: ['rapat', 'acara', 'kajian', 'tamu'] },
    { value: 'transportasi', label: 'Transportasi', subkategori: ['bensin', 'parkir', 'tol', 'transport_ustadz'] },
    { value: 'lainnya', label: 'Lainnya', subkategori: [] }
  ];

  useEffect(() => {
    fetchPengeluaran();
  }, []);

  const fetchPengeluaran = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pengeluaran');
      if (response.ok) {
        const data = await response.json();
        setPengeluaranList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching pengeluaran:', error);
      setPengeluaranList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/pengeluaran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'pending'
        }),
      });

      if (response.ok) {
        await fetchPengeluaran();
        setShowForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting pengeluaran:', error);
    }
  };

  const handleApprove = (id: number) => {
    setApproveId(id);
    setShowApproveDialog(true);
  };

  const confirmApprove = async () => {
    if (!approveId) return;
    
    try {
      const response = await fetch(`/api/pengeluaran/${approveId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'disetujui' }),
      });

      if (response.ok) {
        await fetchPengeluaran();
        setShowApproveDialog(false);
        setApproveId(null);
      } else {
        console.error('Failed to approve pengeluaran');
      }
    } catch (error) {
      console.error('Error approving pengeluaran:', error);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/pengeluaran/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchPengeluaran();
        setShowDeleteDialog(false);
        setDeleteId(null);
      }
    } catch (error) {
      console.error('Error deleting pengeluaran:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'distribusi_zakat',
      sub_kategori: '',
      deskripsi: '',
      penerima: '',
      jumlah: 0,
      metode_pembayaran: 'tunai',
      keterangan: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTotalByStatus = (status: string) => {
    return pengeluaranList
      .filter(p => p.status === status)
      .reduce((total, p) => total + p.jumlah, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disetujui': return 'bg-blue-100 text-blue-800';
      case 'dibayar': return 'bg-green-100 text-green-800';
      case 'ditolak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'disetujui': return <CheckCircle className="w-3 h-3" />;
      case 'dibayar': return <CheckCircle className="w-3 h-3" />;
      case 'ditolak': return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getSelectedSubkategori = () => {
    const selectedKategori = kategoriOptions.find(k => k.value === formData.kategori);
    return selectedKategori ? selectedKategori.subkategori : [];
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pengeluaran</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600">Kelola pengajuan dan persetujuan pengeluaran</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm md:text-base min-h-[44px]"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Tambah Pengeluaran
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Pending</p>
            <p className="text-lg md:text-2xl font-bold text-yellow-600">{formatCurrency(getTotalByStatus('pending'))}</p>
            <p className="text-xs md:text-sm text-gray-500">{pengeluaranList.filter(p => p.status === 'pending').length} item</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-lg bg-blue-100 text-blue-600">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Disetujui</p>
            <p className="text-lg md:text-2xl font-bold text-blue-600">{formatCurrency(getTotalByStatus('disetujui'))}</p>
            <p className="text-xs md:text-sm text-gray-500">{pengeluaranList.filter(p => p.status === 'disetujui').length} item</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Dibayar</p>
            <p className="text-lg md:text-2xl font-bold text-green-600">{formatCurrency(getTotalByStatus('dibayar'))}</p>
            <p className="text-xs md:text-sm text-gray-500">{pengeluaranList.filter(p => p.status === 'dibayar').length} item</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-lg bg-red-100 text-red-600">
              <XCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Ditolak</p>
            <p className="text-lg md:text-2xl font-bold text-red-600">{formatCurrency(getTotalByStatus('ditolak'))}</p>
            <p className="text-xs md:text-sm text-gray-500">{pengeluaranList.filter(p => p.status === 'ditolak').length} item</p>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penerima
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
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
              ) : pengeluaranList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Belum ada data pengeluaran
                  </td>
                </tr>
              ) : (
                pengeluaranList.map((pengeluaran) => (
                  <tr key={pengeluaran.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(pengeluaran.tanggal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {pengeluaran.kategori.replace('_', ' ')}
                        </span>
                        {pengeluaran.sub_kategori && (
                          <div className="text-xs text-gray-500 mt-1">{pengeluaran.sub_kategori}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate font-medium">{pengeluaran.deskripsi}</div>
                      <div className="text-xs text-gray-500">{pengeluaran.metode_pembayaran}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pengeluaran.penerima || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {formatCurrency(pengeluaran.jumlah)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pengeluaran.status)}`}>
                        {getStatusIcon(pengeluaran.status)}
                        {pengeluaran.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {pengeluaran.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(pengeluaran.id)}
                            className="text-green-600 hover:text-green-800 font-medium text-xs px-2 py-1 rounded hover:bg-green-50 transition-colors"
                          >
                            Setujui
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(pengeluaran.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Hapus data"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
        ) : pengeluaranList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada data pengeluaran
          </div>
        ) : (
          pengeluaranList.map((pengeluaran) => (
            <div key={pengeluaran.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {pengeluaran.kategori.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pengeluaran.status)}`}>
                      {getStatusIcon(pengeluaran.status)}
                      {pengeluaran.status}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{pengeluaran.deskripsi}</h3>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(pengeluaran.tanggal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-red-600">{formatCurrency(pengeluaran.jumlah)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Penerima:</span>
                  <p className="truncate">{pengeluaran.penerima || '-'}</p>
                </div>
                <div>
                  <span className="font-medium">Metode:</span>
                  <p className="truncate">{pengeluaran.metode_pembayaran}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {pengeluaran.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(pengeluaran.id)}
                      className="text-green-600 hover:text-green-800 font-medium text-xs px-3 py-1.5 rounded bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      Setujui
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(pengeluaran.id)}
                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                  title="Hapus data"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-4">Tambah Pengeluaran</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({...formData, kategori: e.target.value, sub_kategori: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                  >
                    {kategoriOptions.map(kategori => (
                      <option key={kategori.value} value={kategori.value}>
                        {kategori.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {getSelectedSubkategori().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Kategori
                  </label>
                  <select
                    value={formData.sub_kategori}
                    onChange={(e) => setFormData({...formData, sub_kategori: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                  >
                    <option value="">Pilih Sub Kategori</option>
                    {getSelectedSubkategori().map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi *
                </label>
                <textarea
                  required
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                  rows={2}
                  placeholder="Deskripsi detail pengeluaran..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penerima
                  </label>
                  <input
                    type="text"
                    value={formData.penerima}
                    onChange={(e) => setFormData({...formData, penerima: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                    placeholder="Nama penerima (jika ada)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah (Rp) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jumlah ? formData.jumlah.toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      const numValue = value ? parseInt(value) : 0;
                      setFormData({...formData, jumlah: numValue >= 0 ? numValue : 0});
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={formData.metode_pembayaran}
                  onChange={(e) => setFormData({...formData, metode_pembayaran: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                >
                  <option value="tunai">Tunai</option>
                  <option value="transfer">Transfer Bank</option>
                  <option value="e-wallet">E-Wallet</option>
                  <option value="cek">Cek</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                  rows={2}
                  placeholder="Keterangan tambahan..."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-h-[44px]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-h-[44px]"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      {showApproveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Konfirmasi Persetujuan
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menyetujui pengeluaran ini? Setelah disetujui, pengeluaran akan dikonfirmasi dan tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowApproveDialog(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                Batal
              </button>
              <button
                onClick={confirmApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[44px]"
              >
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
