'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { HandCoins, Plus, Loader2, Inbox, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { formatRupiah, parseRupiah } from '@/lib/currency';

interface Infaq {
  id: number;
  nama: string;
  no_telepon: string | null;
  jenis: 'infaq' | 'sedekah';
  tanggal: string;
  jumlah: number;
  metode_pembayaran: string;
  keterangan: string | null;
  sumber: 'manual' | 'online';
  kas_harian_id: number | null;
}

interface Stats {
  total: number; bulanIni: number; totalInfaq: number; totalSedekah: number; jumlahTransaksi: number; dariOnline: number;
}

const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const tgl = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const today = () => new Date().toISOString().split('T')[0];

const input = 'mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 min-h-[44px] focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100';
const label = 'block text-sm font-medium text-slate-800';

export default function InfaqPage() {
  const [list, setList] = useState<Infaq[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'semua' | 'infaq' | 'sedekah'>('semua');
  const [form, setForm] = useState({
    nama: '', no_telepon: '', jenis: 'infaq' as 'infaq' | 'sedekah', tanggal: today(),
    jumlah: '', metode_pembayaran: 'tunai' as 'tunai' | 'transfer', keterangan: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/infaq', { cache: 'no-store' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      setList(data.data || []);
      setStats(data.stats || null);
    } catch {
      setError('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const jumlah = parseRupiah(form.jumlah);
    if (jumlah <= 0) { setError('Jumlah harus lebih dari 0.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/infaq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, jumlah }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'Gagal menyimpan.'); return; }
      setShowForm(false);
      setForm({ nama: '', no_telepon: '', jenis: 'infaq', tanggal: today(), jumlah: '', metode_pembayaran: 'tunai', keterangan: '' });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const shown = filter === 'semua' ? list : list.filter(i => i.jenis === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Infaq & Sedekah"
        description="Riwayat infaq/sedekah dari konfirmasi online yang disetujui dan input manual (tunai)."
        icon={<HandCoins className="w-5 h-5" />}
        actions={
          <>
            <Link href="/infaq-online" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]">
              <Inbox className="w-4 h-4" aria-hidden="true" /> Konfirmasi Online
            </Link>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 min-h-[44px] shadow-sm">
              <Plus className="w-4 h-4" aria-hidden="true" /> Catat Manual
            </button>
          </>
        }
      />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Infaq & Sedekah" value={rupiah(stats.total)} count={`${stats.jumlahTransaksi} transaksi`} icon={<HandCoins className="w-5 h-5" />} color="emerald" />
          <StatCard title="Bulan Ini" value={rupiah(stats.bulanIni)} count="Periode berjalan" icon={<HandCoins className="w-5 h-5" />} color="amber" />
          <StatCard title="Infaq" value={rupiah(stats.totalInfaq)} count="Kategori infaq" icon={<HandCoins className="w-5 h-5" />} color="teal" />
          <StatCard title="Sedekah" value={rupiah(stats.totalSedekah)} count={`${stats.dariOnline} dari website`} icon={<HandCoins className="w-5 h-5" />} color="purple" />
        </div>
      )}

      {error && !showForm && <div role="alert" className="bg-rose-50 text-rose-800 border border-rose-200 rounded-xl p-4">{error}</div>}

      <div role="tablist" aria-label="Filter jenis" className="flex flex-wrap gap-2">
        {(['semua', 'infaq', 'sedekah'] as const).map(f => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize min-h-[44px] ${filter === f ? 'bg-emerald-600 text-white shadow' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-slate-500 gap-2"><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Memuat…</div>
        ) : shown.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Belum ada data infaq/sedekah.</div>
        ) : (
          <>
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Jenis</th>
                  <th className="px-5 py-3">Metode</th>
                  <th className="px-5 py-3">Sumber</th>
                  <th className="px-5 py-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map(i => (
                  <tr key={i.id}>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{tgl(i.tanggal)}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{i.nama}</p>
                      {i.keterangan && <p className="text-xs text-slate-500">{i.keterangan}</p>}
                    </td>
                    <td className="px-5 py-3 capitalize">{i.jenis}</td>
                    <td className="px-5 py-3 capitalize text-slate-600">{i.metode_pembayaran}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${i.sumber === 'online' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'}`}>
                        {i.sumber === 'online' ? 'Website' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-700 tabular-nums">{rupiah(i.jumlah)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="md:hidden divide-y divide-slate-100">
              {shown.map(i => (
                <li key={i.id} className="p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{i.nama}</p>
                      <p className="text-xs text-slate-500">{tgl(i.tanggal)} · <span className="capitalize">{i.jenis}</span> · {i.sumber === 'online' ? 'Website' : 'Manual'}</p>
                    </div>
                    <p className="font-semibold text-emerald-700 tabular-nums">{rupiah(i.jumlah)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="judul-form-infaq" onClick={e => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 id="judul-form-infaq" className="text-lg font-semibold text-slate-900">Catat Infaq / Sedekah Manual</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Tutup" className="h-11 w-11 inline-flex items-center justify-center rounded-lg hover:bg-slate-100"><X className="w-5 h-5" aria-hidden="true" /></button>
            </div>
            {error && <div role="alert" className="bg-rose-50 text-rose-800 border border-rose-200 rounded-xl p-3 text-sm">{error}</div>}
            <div>
              <label htmlFor="f-nama" className={label}>Nama</label>
              <input id="f-nama" required className={input} value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama atau 'Hamba Allah'" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-jenis" className={label}>Jenis</label>
                <select id="f-jenis" className={input} value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value as 'infaq' | 'sedekah' })}>
                  <option value="infaq">Infaq</option>
                  <option value="sedekah">Sedekah</option>
                </select>
              </div>
              <div>
                <label htmlFor="f-metode" className={label}>Metode</label>
                <select id="f-metode" className={input} value={form.metode_pembayaran} onChange={e => setForm({ ...form, metode_pembayaran: e.target.value as 'tunai' | 'transfer' })}>
                  <option value="tunai">Tunai</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label htmlFor="f-tanggal" className={label}>Tanggal</label>
                <input id="f-tanggal" type="date" required max={today()} className={input} value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
              </div>
              <div>
                <label htmlFor="f-jumlah" className={label}>Jumlah (Rp)</label>
                <input id="f-jumlah" inputMode="numeric" required className={`${input} tabular-nums`} value={form.jumlah} onChange={e => setForm({ ...form, jumlah: formatRupiah(e.target.value) })} placeholder="100.000" />
              </div>
            </div>
            <div>
              <label htmlFor="f-telp" className={label}>No. WhatsApp <span className="font-normal text-slate-500">(opsional)</span></label>
              <input id="f-telp" type="tel" className={input} value={form.no_telepon} onChange={e => setForm({ ...form, no_telepon: e.target.value })} />
            </div>
            <div>
              <label htmlFor="f-ket" className={label}>Keterangan <span className="font-normal text-slate-500">(opsional)</span></label>
              <textarea id="f-ket" rows={2} className={input} value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 min-h-[48px]">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Plus className="w-5 h-5" aria-hidden="true" />} Simpan & Masukkan ke Kas
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
