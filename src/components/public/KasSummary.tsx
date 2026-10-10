import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import type { RingkasanKas } from '@/lib/public-site';

const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export default function KasSummary({ data, compact = false }: { data: RingkasanKas; compact?: boolean }) {
  const updated = data.terakhirDiperbarui
    ? new Date(data.terakhirDiperbarui).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const cards = [
    { label: 'Total Pemasukan', value: data.totalMasuk, sub: `Bulan ini ${rupiah(data.bulanIni.masuk)}`, Icon: TrendingUp, tone: 'text-emerald-700 bg-emerald-50 ring-emerald-100' },
    { label: 'Total Pengeluaran', value: data.totalKeluar, sub: `Bulan ini ${rupiah(data.bulanIni.keluar)}`, Icon: TrendingDown, tone: 'text-rose-700 bg-rose-50 ring-rose-100' },
    { label: 'Posisi Kas Saat Ini', value: data.saldo, sub: updated ? `Diperbarui ${updated}` : 'Belum ada transaksi', Icon: Wallet, tone: 'text-amber-800 bg-amber-50 ring-amber-100', highlight: true },
  ];

  return (
    <section aria-labelledby="judul-kas" className={compact ? '' : 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'}>
      <h2 id="judul-kas" className="sr-only">Ringkasan keuangan masjid</h2>
      <dl className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, sub, Icon, tone, highlight }) => (
          <div
            key={label}
            className={`rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-200 ${highlight ? 'sm:col-span-1 border-t-4 border-amber-500' : ''}`}
          >
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm font-medium text-slate-600">{label}</dt>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <dd className="mt-3 font-heading text-2xl sm:text-3xl font-semibold text-slate-900 tabular-nums break-words">
              {rupiah(value)}
            </dd>
            <dd className="mt-1 text-xs text-slate-500">{sub}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
