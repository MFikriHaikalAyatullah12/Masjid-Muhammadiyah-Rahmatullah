import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowUp, ArrowDown, Calendar, User } from 'lucide-react';

interface Transaction {
  id: number;
  tanggal: string;
  jenis_transaksi: string;
  kategori: string;
  deskripsi: string;
  jumlah: number;
  saldo_sesudah: number;
  petugas: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-4 md:p-6 text-center text-gray-500">
        <div className="py-8">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-sm md:text-base">Belum ada transaksi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Layout */}
      <div className="block md:hidden space-y-3">
        {transactions.slice(0, 5).map((transaction) => (
          <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {transaction.jenis_transaksi === 'masuk' ? (
                  <ArrowUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-semibold ${
                  transaction.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(transaction.jumlah)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {format(new Date(transaction.tanggal), 'dd MMM', { locale: id })}
              </span>
            </div>
            <p className="text-sm text-gray-900 font-medium mb-1 line-clamp-2">
              {transaction.deskripsi}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="bg-gray-200 px-2 py-1 rounded-full">
                {transaction.kategori.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{transaction.petugas}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 8).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(transaction.tanggal), 'dd MMM yyyy', { locale: id })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate font-medium">{transaction.deskripsi}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      {transaction.petugas}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {transaction.kategori.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={`flex items-center gap-1 font-semibold ${
                      transaction.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.jenis_transaksi === 'masuk' ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      {formatCurrency(transaction.jumlah)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(transaction.saldo_sesudah)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More Link */}
      {transactions.length > 5 && (
        <div className="text-center pt-4 border-t border-gray-200">
          <a 
            href="/laporan" 
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1"
          >
            Lihat Semua Transaksi
            <ArrowUp className="w-4 h-4 rotate-45" />
          </a>
        </div>
      )}
    </div>
  );
}