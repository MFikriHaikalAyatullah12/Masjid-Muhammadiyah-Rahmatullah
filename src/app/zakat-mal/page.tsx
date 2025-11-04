'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, Calculator, Trash2 } from 'lucide-react';

interface ZakatMal {
  id: number;
  nama_muzakki: string;
  alamat_muzakki: string;
  no_telepon: string;
  jenis_harta: string;
  nilai_harta: number;
  nisab: number;
  haul_terpenuhi: boolean;
  persentase_zakat: number;
  jumlah_zakat: number;
  tanggal_bayar: string;
  tahun_hijriah: string;
  status: string;
  keterangan: string;
}

export default function ZakatMalPage() {
  const [zakatList, setZakatList] = useState<ZakatMal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama_muzakki: '',
    alamat_muzakki: '',
    no_telepon: '',
    jenis_harta: 'emas',
    nilai_harta: 0,
    nisab: 85000000, // 85 gram x 1 juta (harga emas per gram)
    haul_terpenuhi: false,
    persentase_zakat: 2.5,
    tanggal_bayar: new Date().toISOString().split('T')[0],
    tahun_hijriah: '1446',
    keterangan: ''
  });

  // Calculator state
  const [calculator, setCalculator] = useState({
    jenis_harta: 'emas',
    harga_emas_per_gram: 1000000,
    harga_perak_per_gram: 15000,
    berat_emas: 0,
    berat_perak: 0,
    nilai_uang: 0,
    nilai_perdagangan: 0
  });

  useEffect(() => {
    fetchZakatMal();
  }, []);

  const fetchZakatMal = async () => {
    try {
      const response = await fetch('/api/zakat-mal');
      if (!response.ok) {
        throw new Error('Failed to fetch zakat mal');
      }
      const data = await response.json();
      setZakatList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching zakat mal:', error);
      setZakatList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/zakat-mal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchZakatMal();
        setShowForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating zakat mal:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_muzakki: '',
      alamat_muzakki: '',
      no_telepon: '',
      jenis_harta: 'emas',
      nilai_harta: 0,
      nisab: 85000000,
      haul_terpenuhi: false,
      persentase_zakat: 2.5,
      tanggal_bayar: new Date().toISOString().split('T')[0],
      tahun_hijriah: '1446',
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

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/zakat-mal/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchZakatMal();
        setShowDeleteDialog(false);
        setDeleteId(null);
      } else {
        console.error('Failed to delete zakat mal');
      }
    } catch (error) {
      console.error('Error deleting zakat mal:', error);
    }
  };

  const calculateZakat = () => {
    if (formData.nilai_harta >= formData.nisab && formData.haul_terpenuhi) {
      return (formData.nilai_harta * formData.persentase_zakat) / 100;
    }
    return 0;
  };

  const calculateFromCalculator = () => {
    let nilai_harta = 0;
    let nisab = 0;
    
    switch (calculator.jenis_harta) {
      case 'emas':
        nilai_harta = calculator.berat_emas * calculator.harga_emas_per_gram;
        nisab = 85 * calculator.harga_emas_per_gram; // 85 gram emas
        break;
      case 'perak':
        nilai_harta = calculator.berat_perak * calculator.harga_perak_per_gram;
        nisab = 595 * calculator.harga_perak_per_gram; // 595 gram perak
        break;
      case 'uang':
        nilai_harta = calculator.nilai_uang;
        nisab = 85 * calculator.harga_emas_per_gram; // nisab setara emas
        break;
      case 'perdagangan':
        nilai_harta = calculator.nilai_perdagangan;
        nisab = 85 * calculator.harga_emas_per_gram; // nisab setara emas
        break;
    }
    
    return { nilai_harta, nisab };
  };

  const copyFromCalculator = () => {
    const { nilai_harta, nisab } = calculateFromCalculator();
    setFormData({
      ...formData,
      jenis_harta: calculator.jenis_harta,
      nilai_harta,
      nisab
    });
    setShowCalculator(false);
  };

  const getNisabText = (jenis: string) => {
    switch (jenis) {
      case 'emas': return '85 gram emas';
      case 'perak': return '595 gram perak';
      case 'uang': return 'setara 85 gram emas';
      case 'perdagangan': return 'setara 85 gram emas';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Zakat Mal</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600">Kelola penerimaan zakat mal (zakat harta)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <button 
            onClick={() => setShowCalculator(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm md:text-base min-h-[44px]"
          >
            <Calculator className="w-4 h-4 md:w-5 md:h-5" />
            Kalkulator
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base min-h-[44px]"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Tambah Zakat Mal
          </button>
        </div>
      </div>

          {/* Calculator Modal */}
          {showCalculator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Kalkulator Zakat Mal</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Harta
                    </label>
                    <select
                      value={calculator.jenis_harta}
                      onChange={(e) => setCalculator({...calculator, jenis_harta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="emas">Emas</option>
                      <option value="perak">Perak</option>
                      <option value="uang">Uang/Tabungan</option>
                      <option value="perdagangan">Perdagangan</option>
                    </select>
                  </div>

                  {calculator.jenis_harta === 'emas' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga Emas per Gram (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={calculator.harga_emas_per_gram || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setCalculator({...calculator, harga_emas_per_gram: value >= 0 ? value : 0});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Berat Emas (gram)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={calculator.berat_emas || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setCalculator({...calculator, berat_emas: value >= 0 ? value : 0});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nisab: 85 gram</p>
                      </div>
                    </>
                  )}

                  {calculator.jenis_harta === 'perak' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga Perak per Gram (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={calculator.harga_perak_per_gram || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setCalculator({...calculator, harga_perak_per_gram: value >= 0 ? value : 0});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Berat Perak (gram)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={calculator.berat_perak || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setCalculator({...calculator, berat_perak: value >= 0 ? value : 0});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nisab: 595 gram</p>
                      </div>
                    </>
                  )}

                  {calculator.jenis_harta === 'uang' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nilai Uang/Tabungan (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={calculator.nilai_uang || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setCalculator({...calculator, nilai_uang: value >= 0 ? value : 0});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  )}

                  {calculator.jenis_harta === 'perdagangan' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nilai Perdagangan (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={calculator.nilai_perdagangan || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setCalculator({...calculator, nilai_perdagangan: value >= 0 ? value : 0});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  )}

                  {/* Result */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Nilai Harta:</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(calculateFromCalculator().nilai_harta)}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Nisab:</div>
                    <div className="text-md font-medium text-gray-900">
                      {formatCurrency(calculateFromCalculator().nisab)}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Zakat (2.5%):</div>
                    <div className="text-lg font-bold text-green-600">
                      {calculateFromCalculator().nilai_harta >= calculateFromCalculator().nisab 
                        ? formatCurrency(calculateFromCalculator().nilai_harta * 0.025)
                        : 'Belum mencapai nisab'
                      }
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowCalculator(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={copyFromCalculator}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Gunakan untuk Form
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Tambah Zakat Mal</h2>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Harta *
                      </label>
                      <select
                        value={formData.jenis_harta}
                        onChange={(e) => setFormData({...formData, jenis_harta: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="emas">Emas</option>
                        <option value="perak">Perak</option>
                        <option value="uang">Uang/Tabungan</option>
                        <option value="perdagangan">Perdagangan</option>
                        <option value="pertanian">Pertanian</option>
                        <option value="peternakan">Peternakan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Persentase Zakat (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.persentase_zakat}
                        onChange={(e) => setFormData({...formData, persentase_zakat: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nilai Harta (Rp) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.nilai_harta || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setFormData({...formData, nilai_harta: value >= 0 ? value : 0});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nisab (Rp) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.nisab || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setFormData({...formData, nisab: value >= 0 ? value : 0});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {getNisabText(formData.jenis_harta)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="haul_terpenuhi"
                      checked={formData.haul_terpenuhi}
                      onChange={(e) => setFormData({...formData, haul_terpenuhi: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="haul_terpenuhi" className="text-sm text-gray-700">
                      Haul sudah terpenuhi (harta dimiliki selama 1 tahun)
                    </label>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Jumlah Zakat:</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(calculateZakat())}
                    </div>
                    {!formData.haul_terpenuhi && (
                      <p className="text-xs text-orange-600 mt-1">
                        Haul belum terpenuhi, zakat belum wajib dibayar
                      </p>
                    )}
                    {formData.nilai_harta < formData.nisab && (
                      <p className="text-xs text-orange-600 mt-1">
                        Nilai harta belum mencapai nisab
                      </p>
                    )}
                  </div>

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

      {/* Table - Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Muzakki
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Harta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nilai Harta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zakat
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
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : zakatList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Belum ada data zakat mal
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {zakat.jenis_harta}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(zakat.nilai_harta)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatCurrency(zakat.jumlah_zakat)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        zakat.status === 'diterima' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
            Belum ada data zakat mal
          </div>
        ) : (
          zakatList.map((zakat) => (
            <div key={zakat.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{zakat.nama_muzakki}</h3>
                  <p className="text-xs text-gray-500 mt-1">{zakat.no_telepon}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {zakat.jenis_harta}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      zakat.status === 'diterima' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                  <span className="font-medium">Nilai Harta:</span>
                  <p className="text-gray-900 font-medium">{formatCurrency(zakat.nilai_harta)}</p>
                </div>
                <div>
                  <span className="font-medium">Zakat:</span>
                  <p className="text-blue-600 font-medium">{formatCurrency(zakat.jumlah_zakat)}</p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                <span className="font-medium">Tanggal:</span> {new Date(zakat.tanggal_bayar).toLocaleDateString('id-ID')}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus data zakat mal ini? Tindakan ini tidak dapat dibatalkan.
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
