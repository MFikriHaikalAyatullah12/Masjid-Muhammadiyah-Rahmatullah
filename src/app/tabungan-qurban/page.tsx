'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Plus, Search, DollarSign, TrendingUp, Target, Trash2 } from 'lucide-react';
import Alert from '@/components/Alert';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import TabunganCharts from '@/components/TabunganCharts';

interface Tabungan {
  id: number;
  nama_penabung: string;
  alamat: string;
  no_telepon: string;
  email: string;
  jenis_hewan: string;
  target_tabungan: number;
  total_terkumpul: number;
  sisa_kekurangan: number;
  tanggal_mulai: string;
  target_qurban_tahun: number;
  status: string;
  keterangan: string;
  jumlah_cicilan: number;
  persentase_terkumpul: number;
}

export default function TabunganQurbanPage() {
  const [tabunganList, setTabunganList] = useState<Tabungan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCicilanModal, setShowCicilanModal] = useState(false);
  const [selectedTabungan, setSelectedTabungan] = useState<Tabungan | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Helper function untuk format rupiah
  const formatRupiah = (value: string) => {
    const number = value.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const unformatRupiah = (value: string) => {
    return value.replace(/\./g, '');
  };

  const [formData, setFormData] = useState({
    nama_penabung: '',
    alamat: '',
    no_telepon: '',
    jenis_hewan: 'kambing',
    target_tabungan: '',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    target_qurban_tahun: new Date().getFullYear() + 1,
    keterangan: ''
  });

  const [cicilanData, setCicilanData] = useState({
    tabungan_id: 0,
    tanggal_bayar: new Date().toISOString().split('T')[0],
    jumlah: '',
    metode_pembayaran: 'tunai',
    petugas: 'Admin',
    keterangan: ''
  });

  useEffect(() => {
    fetchTabungan();
  }, []);

  const fetchTabungan = async () => {
    try {
      const response = await fetch('/api/tabungan-qurban');
      const data = await response.json();
      if (data.success) {
        setTabunganList(data.data);
      }
    } catch (error) {
      console.error('Error fetching tabungan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      target_tabungan: unformatRupiah(formData.target_tabungan)
    };
    
    console.log('Submitting tabungan data:', submitData);
    
    try {
      const response = await fetch('/api/tabungan-qurban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      console.log('Tabungan response status:', response.status);
      const data = await response.json();
      console.log('Tabungan response data:', data);
      
      if (data.success) {
        setAlert({ type: 'success', message: 'Tabungan qurban berhasil dibuat!' });
        setShowAddModal(false);
        fetchTabungan();
        resetForm();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal membuat tabungan' });
      }
    } catch (error) {
      console.error('Error submitting tabungan:', error);
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat membuat tabungan' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data tabungan ini?')) return;
    
    try {
      const response = await fetch(`/api/tabungan-qurban/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'Tabungan berhasil dihapus!' });
        fetchTabungan();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menghapus tabungan' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat menghapus tabungan' });
    }
  };

  const handleCicilan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...cicilanData,
      jumlah: unformatRupiah(cicilanData.jumlah)
    };
    
    console.log('Submitting cicilan data:', submitData);
    
    try {
      const response = await fetch('/api/cicilan-qurban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      console.log('Cicilan response status:', response.status);
      const data = await response.json();
      console.log('Cicilan response data:', data);
      
      if (data.success) {
        setAlert({ type: 'success', message: 'Cicilan berhasil dibayar!' });
        setShowCicilanModal(false);
        fetchTabungan();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal mencatat cicilan' });
      }
    } catch (error) {
      console.error('Error submitting cicilan:', error);
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat mencatat cicilan' });
    }
  };

  const openCicilanModal = (tabungan: Tabungan) => {
    setSelectedTabungan(tabungan);
    setCicilanData({
      ...cicilanData,
      tabungan_id: tabungan.id
    });
    setShowCicilanModal(true);
  };

  const resetForm = () => {
    setFormData({
      nama_penabung: '',
      alamat: '',
      no_telepon: '',
      jenis_hewan: 'kambing',
      target_tabungan: '',
      tanggal_mulai: new Date().toISOString().split('T')[0],
      target_qurban_tahun: new Date().getFullYear() + 1,
      keterangan: ''
    });
  };

  const filteredTabungan = tabunganList.filter(tabungan =>
    tabungan.nama_penabung.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tabungan.no_telepon.includes(searchTerm)
  );

  const totalTabunganAktif = tabunganList.filter(t => t.status === 'menabung').length;
  const totalTerkumpul = tabunganList.reduce((sum, t) => sum + parseFloat(t.total_terkumpul.toString()), 0);
  const totalTarget = tabunganList.reduce((sum, t) => sum + parseFloat(t.target_tabungan.toString()), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'terpenuhi':
        return 'bg-emerald-50 text-emerald-700';
      case 'menabung':
        return 'bg-blue-50 text-blue-700';
      case 'diambil':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getJenisHewanIcon = (jenis: string) => {
    switch (jenis.toLowerCase()) {
      case 'sapi':
        return '🐄';
      case 'kambing':
        return '🐐';
      case 'domba':
        return '🐏';
      default:
        return '🐑';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-purple-600" />
            Tabungan Qurban
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola tabungan hewan qurban dengan sistem cicilan</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Buat Tabungan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tabungan Aktif</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalTabunganAktif}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Terkumpul</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                Rp {totalTerkumpul.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Target Total</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                Rp {totalTarget.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-6">
        <TabunganCharts tabunganData={tabunganList} />
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari penabung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
          />
        </div>
      </div>

      {/* Tabungan List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTabungan.map((tabungan) => (
          <div key={tabungan.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{getJenisHewanIcon(tabungan.jenis_hewan)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tabungan.nama_penabung}</h3>
                    <p className="text-xs text-gray-500">{tabungan.jenis_hewan} • Tahun {tabungan.target_qurban_tahun}H</p>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tabungan.status)}`}>
                {tabungan.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-purple-600">{tabungan.persentase_terkumpul}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(tabungan.persentase_terkumpul, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Target:</span>
                <span className="font-medium text-gray-900">
                  Rp {parseFloat(tabungan.target_tabungan.toString()).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Terkumpul:</span>
                <span className="font-medium text-emerald-600">
                  Rp {parseFloat(tabungan.total_terkumpul.toString()).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Sisa:</span>
                <span className="font-medium text-orange-600">
                  Rp {parseFloat(tabungan.sisa_kekurangan.toString()).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Jumlah cicilan:</span>
                <span className="font-medium text-gray-900">{tabungan.jumlah_cicilan}x</span>
              </div>
            </div>

            {tabungan.status === 'menabung' && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => openCicilanModal(tabungan)}
                  className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Bayar Cicilan
                </button>
                <button
                  onClick={() => handleDelete(tabungan.id)}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Data
                </button>
              </div>
            )}

            {tabungan.status === 'terpenuhi' && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="text-center text-sm text-emerald-600 font-medium">
                  ✓ Target Terpenuhi
                </div>
                <button
                  onClick={() => handleDelete(tabungan.id)}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Data
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTabungan.length === 0 && (
        <div className="card p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada tabungan qurban</p>
        </div>
      )}

      {/* Add Tabungan Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Buat Tabungan Qurban"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Penabung *
            </label>
            <input
              type="text"
              required
              value={formData.nama_penabung}
              onChange={(e) => setFormData({...formData, nama_penabung: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <textarea
              value={formData.alamat}
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Hewan *
              </label>
              <select
                value={formData.jenis_hewan}
                onChange={(e) => setFormData({...formData, jenis_hewan: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
              >
                <option value="kambing">🐐 Kambing</option>
                <option value="domba">🐏 Domba</option>
                <option value="sapi">🐄 Sapi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Tabungan *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="text"
                  required
                  value={formData.target_tabungan}
                  onChange={(e) => setFormData({...formData, target_tabungan: formatRupiah(e.target.value)})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
                  placeholder="3.000.000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                value={formData.tanggal_mulai}
                onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Tahun *
              </label>
              <input
                type="number"
                required
                value={formData.target_qurban_tahun}
                onChange={(e) => setFormData({...formData, target_qurban_tahun: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
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
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      {/* Cicilan Modal */}
      <Modal
        isOpen={showCicilanModal}
        onClose={() => setShowCicilanModal(false)}
        title="Bayar Cicilan"
      >
        <form onSubmit={handleCicilan} className="space-y-4">
          {selectedTabungan && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{getJenisHewanIcon(selectedTabungan.jenis_hewan)}</span>
                <div>
                  <p className="font-semibold text-gray-900">{selectedTabungan.nama_penabung}</p>
                  <p className="text-sm text-gray-600">{selectedTabungan.jenis_hewan}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-purple-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sisa kekurangan:</span>
                  <span className="font-semibold text-purple-900">
                    Rp {parseFloat(selectedTabungan.sisa_kekurangan.toString()).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Bayar *
              </label>
              <input
                type="date"
                required
                value={cicilanData.tanggal_bayar}
                onChange={(e) => setCicilanData({...cicilanData, tanggal_bayar: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Bayar *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="text"
                  required
                  value={cicilanData.jumlah}
                  onChange={(e) => setCicilanData({...cicilanData, jumlah: formatRupiah(e.target.value)})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
                  placeholder="500.000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={cicilanData.metode_pembayaran}
                onChange={(e) => setCicilanData({...cicilanData, metode_pembayaran: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
              >
                <option value="tunai">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Petugas
              </label>
              <input
                type="text"
                value={cicilanData.petugas}
                onChange={(e) => setCicilanData({...cicilanData, petugas: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              value={cicilanData.keterangan}
              onChange={(e) => setCicilanData({...cicilanData, keterangan: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCicilanModal(false)}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              Bayar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
