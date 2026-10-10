'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Inbox, CheckCircle2, XCircle, Eye, Loader2, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { KATEGORI_SUMBANGAN, ringkasDetail, type DetailSumbangan, type KategoriSumbangan } from '@/lib/sumbangan';

interface InfaqOnline {
  id: number;
  nama: string;
  no_telepon: string | null;
  kategori: KategoriSumbangan;
  jenis: 'infaq' | 'sedekah';
  detail: DetailSumbangan;
  tanggal: string;
  nominal: number;
  catatan: string | null;
  bukti_size: number;
  status: 'pending' | 'diterima' | 'ditolak';
  kas_harian_id: number | null;
  ref_table: string | null;
  ref_id: number | null;
  diproses_at: string | null;
  created_at: string;
}

const REF_LINK: Record<string, { href: string; label: string }> = {
  infaq: { href: '/data-infaq', label: 'Infaq & Sedekah' },
  zakat_fitrah: { href: '/zakat-fitrah', label: 'Zakat Fitrah' },
  zakat_mal: { href: '/zakat-mal', label: 'Zakat Mal' },
  pembayaran_donatur: { href: '/donatur-bulanan', label: 'Donatur Bulanan' },
  cicilan_qurban: { href: '/tabungan-qurban', label: 'Tabungan Qurban' },
};

type Filter = 'pending' | 'diterima' | 'ditolak' | 'semua';

const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const tgl = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const kb = (b: number) => `${Math.round(b / 1024)} KB`;

const badge: Record<InfaqOnline['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  diterima: 'bg-emerald-100 text-emerald-800',
  ditolak: 'bg-rose-100 text-rose-800',
};

export default function InfaqOnlinePage() {
  const [filter, setFilter] = useState<Filter>('pending');
  const [list, setList] = useState<InfaqOnline[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ id: number; src: string | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/infaq-online?status=${filter}`, { cache: 'no-store' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setList(data.data);
      setPendingCount(data.pendingCount);
    } catch {
      setError('Gagal memuat data. Coba muat ulang.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openPreview = async (id: number) => {
    setPreview({ id, src: null });
    try {
      const res = await fetch(`/api/infaq-online/${id}`);
      const data = await res.json();
      setPreview({ id, src: data.bukti || null });
    } catch {
      setPreview(null);
      alert('Gagal memuat bukti.');
    }
  };

  const proses = async (item: InfaqOnline, action: 'terima' | 'tolak') => {
    const tujuan = KATEGORI_SUMBANGAN[item.kategori]?.label || 'Infaq';
    const label = action === 'terima'
      ? `Terima ${tujuan} dari ${item.nama} sebesar ${rupiah(item.nominal)}?\nData akan masuk ke menu ${tujuan} dan Kas Harian.`
      : `Tolak kiriman dari ${item.nama}? Kiriman tidak akan masuk kas.`;
    if (!confirm(label)) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/infaq-online/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || 'Gagal memproses.'); return; }
      setPreview(null);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'pending', label: `Menunggu${pendingCount ? ` (${pendingCount})` : ''}` },
    { key: 'diterima', label: 'Diterima' },
    { key: 'ditolak', label: 'Ditolak' },
    { key: 'semua', label: 'Semua' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Infaq & Sedekah Online"
        description="Konfirmasi dari jamaah lewat website. Terima untuk membukukan ke Kas Harian."
        icon={<Inbox className="w-5 h-5" />}
        actions={
          <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /> Muat ulang
          </button>
        }
      />

      <div role="tablist" aria-label="Filter status" className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${filter === f.key ? 'bg-emerald-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div role="alert" className="bg-rose-50 text-rose-800 border border-rose-200 rounded-xl p-4">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-gray-500 gap-2"><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Memuat…</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Tidak ada kiriman pada filter ini.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map(item => (
              <li key={item.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{item.nama}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${badge[item.status]}`}>{item.status}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                      {KATEGORI_SUMBANGAN[item.kategori]?.label || item.kategori}
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-emerald-700 tabular-nums">{rupiah(item.nominal)}</p>
                  <p className="text-sm text-slate-700">{ringkasDetail(item.kategori, item.detail || {})}</p>
                  <p className="text-sm text-gray-600">
                    Transfer {tgl(item.tanggal)} · dikirim {tgl(item.created_at)} · bukti {kb(item.bukti_size)}
                    {item.no_telepon && <> · <a href={`https://wa.me/${item.no_telepon.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline underline-offset-2">{item.no_telepon}</a></>}
                  </p>
                  {item.catatan && <p className="mt-1 text-sm text-gray-700 italic">“{item.catatan}”</p>}
                  {item.ref_table && REF_LINK[item.ref_table] && (
                    <p className="mt-1 text-xs text-gray-500">
                      Tersimpan di <Link href={REF_LINK[item.ref_table].href} className="text-emerald-700 underline underline-offset-2">{REF_LINK[item.ref_table].label}</Link>
                      {item.kas_harian_id && <> · Kas Harian #{item.kas_harian_id}</>}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button onClick={() => openPreview(item.id)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]">
                    <Eye className="w-4 h-4" aria-hidden="true" /> Lihat bukti
                  </button>
                  {item.status === 'pending' && (
                    <>
                      <button disabled={busyId === item.id} onClick={() => proses(item, 'terima')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 min-h-[44px]">
                        {busyId === item.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="w-4 h-4" aria-hidden="true" />} Terima
                      </button>
                      <button disabled={busyId === item.id} onClick={() => proses(item, 'tolak')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 text-sm font-semibold hover:bg-rose-50 disabled:opacity-60 min-h-[44px]">
                        <XCircle className="w-4 h-4" aria-hidden="true" /> Tolak
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div role="dialog" aria-modal="true" aria-label="Bukti transfer" className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-900">Bukti transfer #{preview.id}</p>
              <button onClick={() => setPreview(null)} className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 min-h-[44px]">Tutup</button>
            </div>
            {preview.src ? (
              <img src={preview.src} alt={`Bukti transfer kiriman #${preview.id}`} className="w-full rounded-xl" />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" /></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
