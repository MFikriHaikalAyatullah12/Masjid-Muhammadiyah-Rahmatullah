'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react';
import Modal from '@/components/Modal';
import Alert from '@/components/Alert';
import Loading from '@/components/Loading';

interface Mustahiq {
  id: number;
  nama: string;
  alamat: string;
  no_hp: string;
  kategori: 'fakir' | 'miskin' | 'amil' | 'muallaf' | 'riqab' | 'gharim' | 'sabilillah' | 'ibnu_sabil';
  keterangan?: string;
  status: 'aktif' | 'tidak_aktif';
  created_at: string;
}

export default function MustahiqPage() {
  const [mustahiq, setMustahiq] = useState<Mustahiq[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMustahiq, setEditingMustahiq] = useState<Mustahiq | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  type KategoriMustahiq = 'fakir' | 'miskin' | 'amil' | 'muallaf' | 'riqab' | 'gharim' | 'sabilillah' | 'ibnu_sabil';
  type StatusMustahiq = 'aktif' | 'tidak_aktif';

  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    no_hp: '',
    kategori: 'fakir' as KategoriMustahiq,
    keterangan: '',
    status: 'aktif' as StatusMustahiq
  });

  const kategoriOptions = [
    { value: 'fakir', label: 'Fakir' },
    { value: 'miskin', label: 'Miskin' },
    { value: 'amil', label: 'Amil' },
    { value: 'muallaf', label: 'Muallaf' },
    { value: 'riqab', label: 'Riqab' },
    { value: 'gharim', label: 'Gharim' },
    { value: 'sabilillah', label: 'Sabilillah' },
    { value: 'ibnu_sabil', label: 'Ibnu Sabil' }
  ];

  const fetchMustahiq = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mustahiq');
      if (response.ok) {
        const data = await response.json();
        setMustahiq(Array.isArray(data) ? data : []);
      } else {
        setMustahiq([]);
      }
    } catch (error) {
      console.error('Error fetching mustahiq:', error);
      setMustahiq([]);
      setAlert({ type: 'error', message: 'Gagal memuat data mustahiq' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMustahiq();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingMustahiq ? `/api/mustahiq/${editingMustahiq.id}` : '/api/mustahiq';
      const method = editingMustahiq ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setAlert({ 
          type: 'success', 
          message: editingMustahiq ? 'Mustahiq berhasil diperbarui' : 'Mustahiq berhasil ditambahkan' 
        });
        setShowModal(false);
        setEditingMustahiq(null);
        resetForm();
        fetchMustahiq();
      } else {
        const error = await response.json();
        setAlert({ type: 'error', message: error.message || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error saving mustahiq:', error);
      setAlert({ type: 'error', message: 'Gagal menyimpan data mustahiq' });
    }
  };

  const handleEdit = (mustahiq: Mustahiq) => {
    setEditingMustahiq(mustahiq);
    setFormData({
      nama: mustahiq.nama,
      alamat: mustahiq.alamat,
      no_hp: mustahiq.no_hp,
      kategori: mustahiq.kategori,
      keterangan: mustahiq.keterangan || '',
      status: mustahiq.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus mustahiq ini?')) {
      try {
        const response = await fetch(`/api/mustahiq/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setAlert({ type: 'success', message: 'Mustahiq berhasil dihapus' });
          fetchMustahiq();
        } else {
          const error = await response.json();
          setAlert({ type: 'error', message: error.message || 'Gagal menghapus mustahiq' });
        }
      } catch (error) {
        console.error('Error deleting mustahiq:', error);
        setAlert({ type: 'error', message: 'Gagal menghapus mustahiq' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      alamat: '',
      no_hp: '',
      kategori: 'fakir',
      keterangan: '',
      status: 'aktif'
    });
  };

  const filteredMustahiq = mustahiq.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.alamat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = filterKategori === '' || item.kategori === filterKategori;
    return matchesSearch && matchesKategori;
  });

  if (loading) {
    return <Loading text="Memuat data mustahiq..." />;
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Mustahiq</h1>
              <p className="text-gray-600">Kelola data penerima zakat</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingMustahiq(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            <span>Tambah Mustahiq</span>
          </button>
        </div>
      </div>

      {/* Filter dan Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Mustahiq</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau alamat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Kategori</label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Mustahiq */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. HP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
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
              {filteredMustahiq.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.nama}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{item.alamat}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.no_hp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {kategoriOptions.find(k => k.value === item.kategori)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'aktif' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMustahiq.length === 0 && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data mustahiq</h3>
            <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan mustahiq baru.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingMustahiq(null);
          resetForm();
        }}
        title={editingMustahiq ? 'Edit Mustahiq' : 'Tambah Mustahiq Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat *
            </label>
            <textarea
              required
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. HP *
            </label>
            <input
              type="tel"
              required
              value={formData.no_hp}
              onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              required
              value={formData.kategori}
              onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            >
              {kategoriOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            >
              <option value="aktif">Aktif</option>
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingMustahiq(null);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {editingMustahiq ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
