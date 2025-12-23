'use client';

import { useState, useEffect } from 'react';
import { CalendarHeart, Plus, Search, Edit, Trash2, DollarSign, Calendar } from 'lucide-react';
import Alert from '@/components/Alert';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';

interface Donatur {
  id: number;
  nama: string;
  alamat: string;
  no_telepon: string;
  email: string;
  jumlah_donasi: number;
  tanggal_mulai: string;
  status: string;
  metode_pembayaran: string;
  tanggal_pembayaran: number;
  keterangan: string;
  total_pembayaran: number;
  total_terbayar: number;
}

interface PembayaranForm {
  donatur_id: number;
  tanggal_bayar: string;
  bulan: number;
  tahun: number;
  jumlah: string | number;
  metode_pembayaran: string;
  keterangan: string;
}

export default function DonaturBulananPage() {
  const [donaturList, setDonaturList] = useState<Donatur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDonatur, setSelectedDonatur] = useState<Donatur | null>(null);
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
    nama: '',
    alamat: '',
    no_telepon: '',
    jumlah_donasi: '',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    metode_pembayaran: 'transfer',
    tanggal_pembayaran: 1,
    keterangan: ''
  });

  const [paymentData, setPaymentData] = useState<PembayaranForm>({
    donatur_id: 0,
    tanggal_bayar: new Date().toISOString().split('T')[0],
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    jumlah: '',
    metode_pembayaran: 'transfer',
    keterangan: ''
  });

  useEffect(() => {
    fetchDonatur();
  }, []);

  const fetchDonatur = async () => {
    try {
      const response = await fetch('/api/donatur-bulanan');
      const data = await response.json();
      if (data.success) {
        setDonaturList(data.data);
      }
    } catch (error) {
      console.error('Error fetching donatur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      jumlah_donasi: unformatRupiah(formData.jumlah_donasi)
    };
    
    console.log('Submitting form data:', submitData);
    
    try {
      const response = await fetch('/api/donatur-bulanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setAlert({ type: 'success', message: 'Donatur berhasil ditambahkan!' });
        setShowAddModal(false);
        fetchDonatur();
        resetForm();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menambahkan donatur' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat menambahkan donatur' });
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...paymentData,
      jumlah: typeof paymentData.jumlah === 'string' ? parseFloat(unformatRupiah(paymentData.jumlah)) : paymentData.jumlah
    };
    
    console.log('Submitting payment data:', submitData);
    
    try {
      const response = await fetch('/api/pembayaran-donatur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      console.log('Payment response status:', response.status);
      const data = await response.json();
      console.log('Payment response data:', data);
      
      if (data.success) {
        setAlert({ type: 'success', message: 'Pembayaran berhasil dicatat!' });
        setShowPaymentModal(false);
        fetchDonatur();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal mencatat pembayaran' });
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat mencatat pembayaran' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus donatur ini?')) return;
    
    try {
      const response = await fetch(`/api/donatur-bulanan/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'Donatur berhasil dihapus!' });
        fetchDonatur();
      } else {
        setAlert({ type: 'error', message: data.error });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat menghapus donatur' });
    }
  };

  const openPaymentModal = (donatur: Donatur) => {
    setSelectedDonatur(donatur);
    setPaymentData({
      ...paymentData,
      donatur_id: donatur.id,
      jumlah: donatur.jumlah_donasi
    });
    setShowPaymentModal(true);
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      alamat: '',
      no_telepon: '',
      jumlah_donasi: '',
      tanggal_mulai: new Date().toISOString().split('T')[0],
      metode_pembayaran: 'transfer',
      tanggal_pembayaran: 1,
      keterangan: ''
    });
  };

  const filteredDonatur = donaturList.filter(donatur =>
    donatur.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donatur.no_telepon.includes(searchTerm)
  );

  const totalDonaturAktif = donaturList.filter(d => d.status === 'aktif').length;
  const totalDonasiPerBulan = donaturList
    .filter(d => d.status === 'aktif')
    .reduce((sum, d) => sum + parseFloat(d.jumlah_donasi.toString()), 0);

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
            <CalendarHeart className="w-7 h-7 text-emerald-600" />
            Donatur Bulanan
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola donatur yang menyumbang setiap bulan</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Donatur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Donatur Aktif</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalDonaturAktif}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CalendarHeart className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Target Per Bulan</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                Rp {totalDonasiPerBulan.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Donatur</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{donaturList.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari donatur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
          />
        </div>
      </div>

      {/* Donatur List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDonatur.map((donatur) => (
          <div key={donatur.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{donatur.nama}</h3>
                <p className="text-sm text-gray-500 mt-1">{donatur.no_telepon}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                donatur.status === 'aktif' 
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {donatur.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Donasi per bulan:</span>
                <span className="font-medium text-gray-900">
                  Rp {parseFloat(donatur.jumlah_donasi.toString()).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tanggal bayar:</span>
                <span className="font-medium text-gray-900">Setiap tanggal {donatur.tanggal_pembayaran}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total pembayaran:</span>
                <span className="font-medium text-emerald-600">{donatur.total_pembayaran || 0}x</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => openPaymentModal(donatur)}
                className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                <DollarSign className="w-4 h-4 inline mr-1" />
                Catat Bayar
              </button>
              <button
                onClick={() => handleDelete(donatur.id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDonatur.length === 0 && (
        <div className="card p-12 text-center">
          <CalendarHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada donatur bulanan</p>
        </div>
      )}

      {/* Add Donatur Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Donatur Bulanan"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Donasi *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="text"
                  required
                  value={formData.jumlah_donasi}
                  onChange={(e) => setFormData({...formData, jumlah_donasi: formatRupiah(e.target.value)})}
                  placeholder="1.500.000"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Bayar
              </label>
              <select
                value={formData.tanggal_pembayaran}
                onChange={(e) => setFormData({...formData, tanggal_pembayaran: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={formData.metode_pembayaran}
                onChange={(e) => setFormData({...formData, metode_pembayaran: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
              >
                <option value="transfer">Transfer</option>
                <option value="tunai">Tunai</option>
                <option value="auto-debit">Auto Debit</option>
              </select>
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
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

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Catat Pembayaran"
      >
        <form onSubmit={handlePayment} className="space-y-4">
          {selectedDonatur && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Donatur:</p>
              <p className="font-semibold text-gray-900">{selectedDonatur.nama}</p>
              <p className="text-sm text-emerald-600 mt-1">
                Rp {parseFloat(selectedDonatur.jumlah_donasi.toString()).toLocaleString('id-ID')} / bulan
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <select
                value={paymentData.bulan}
                onChange={(e) => setPaymentData({...paymentData, bulan: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
              >
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((bulan, idx) => (
                  <option key={idx + 1} value={idx + 1}>{bulan}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <input
                type="number"
                value={paymentData.tahun}
                onChange={(e) => setPaymentData({...paymentData, tahun: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Bayar *
              </label>
              <input
                type="date"
                required
                value={paymentData.tanggal_bayar}
                onChange={(e) => setPaymentData({...paymentData, tanggal_bayar: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="text"
                  required
                  value={typeof paymentData.jumlah === 'number' ? formatRupiah(paymentData.jumlah.toString()) : formatRupiah(paymentData.jumlah)}
                  onChange={(e) => setPaymentData({...paymentData, jumlah: e.target.value as any})}
                  placeholder="500.000"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metode Pembayaran
            </label>
            <select
              value={paymentData.metode_pembayaran}
              onChange={(e) => setPaymentData({...paymentData, metode_pembayaran: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
            >
              <option value="transfer">Transfer</option>
              <option value="tunai">Tunai</option>
              <option value="auto-debit">Auto Debit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              value={paymentData.keterangan}
              onChange={(e) => setPaymentData({...paymentData, keterangan: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
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
    </div>
  );
}
