'use client';

import { useState } from 'react';
import { AlertTriangle, Database, Trash2, Shield } from 'lucide-react';
import Alert from '@/components/Alert';

export default function ResetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleReset = async () => {
    if (confirmText !== 'DELETE_ALL_DATA') {
      setAlert({ type: 'error', message: 'Konfirmasi tidak sesuai. Ketik "DELETE_ALL_DATA" dengan benar.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: confirmText }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlert({ type: 'success', message: data.message });
        setConfirmText('');
        setShowConfirmDialog(false);
      } else {
        const error = await response.json();
        setAlert({ type: 'error', message: error.error || 'Gagal mereset database' });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat mereset database' });
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Database</h1>
          <p className="text-gray-600">Hapus semua data dari sistem</p>
        </div>
      </div>

      {/* Warning Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-red-900 mb-2">⚠️ PERINGATAN PENTING</h2>
            <div className="text-red-800 space-y-2">
              <p className="font-semibold">Tindakan ini akan menghapus SEMUA data secara permanen:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Semua data kas harian</li>
                <li>Semua data zakat fitrah</li>
                <li>Semua data zakat mal</li>
                <li>Semua data mustahiq</li>
                <li>Semua data pengeluaran</li>
              </ul>
              <p className="font-bold text-red-900 mt-4">
                Data yang dihapus TIDAK DAPAT dikembalikan!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Keamanan</h3>
          </div>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Proses menggunakan transaksi database</li>
            <li>• Rollback otomatis jika terjadi error</li>
            <li>• Sequence ID akan direset ke 1</li>
            <li>• Membutuhkan konfirmasi teks khusus</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">Yang Akan Terjadi</h3>
          </div>
          <ul className="text-yellow-800 space-y-1 text-sm">
            <li>• Database kembali ke kondisi kosong</li>
            <li>• ID auto-increment direset</li>
            <li>• Struktur tabel tetap utuh</li>
            <li>• Siap untuk data baru</li>
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Database</h3>
          <p className="text-gray-600 mb-6">
            Klik tombol di bawah untuk memulai proses reset database
          </p>
          
          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isLoading ? 'Memproses...' : 'Reset Database'}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-xl w-full max-w-md border border-gray-200">
            <div className="p-6">
              <div className="text-center mb-6">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Reset Database</h3>
                <p className="text-gray-600">
                  Untuk melanjutkan, ketik <span className="font-mono font-bold text-red-600">DELETE_ALL_DATA</span> di bawah ini:
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Teks
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE_ALL_DATA"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Harus persis sama: DELETE_ALL_DATA
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setConfirmText('');
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isLoading || confirmText !== 'DELETE_ALL_DATA'}
                    className="px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Menghapus...' : 'Reset Database'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}