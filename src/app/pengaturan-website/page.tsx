'use client';

import { useEffect, useState } from 'react';
import { Settings, Plus, Trash2, Save, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import type { SiteSettings, KegiatanRutin } from '@/lib/public-site';

const input = 'mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 min-h-[48px] focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100';
const label = 'block text-sm font-medium text-gray-800';

export default function PengaturanWebsitePage() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/pengaturan-website', { cache: 'no-store' })
      .then(r => { if (r.status === 401) window.location.href = '/login'; return r.json(); })
      .then(setForm)
      .catch(() => setMsg({ ok: false, text: 'Gagal memuat pengaturan.' }));
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm(f => (f ? { ...f, [key]: value } : f));

  const setKegiatan = (i: number, patch: Partial<KegiatanRutin>) =>
    set('kegiatan_rutin', form!.kegiatan_rutin.map((k, idx) => (idx === i ? { ...k, ...patch } : k)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/pengaturan-website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg({ ok: false, text: data.error || 'Gagal menyimpan.' }); return; }
      setForm(data.data);
      setMsg({ ok: true, text: 'Tersimpan. Laman publik sudah menampilkan perubahan.' });
    } catch {
      setMsg({ ok: false, text: 'Koneksi bermasalah.' });
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return <div className="p-12 flex items-center justify-center text-gray-500 gap-2"><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Memuat…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <PageHeader
        title="Pengaturan Website"
        description="Konten yang tampil di laman publik untuk jamaah."
        icon={<Settings className="w-5 h-5" />}
        actions={
          <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]">
            <ExternalLink className="w-4 h-4" aria-hidden="true" /> Lihat laman publik
          </a>
        }
      />

      {msg && (
        <div role={msg.ok ? 'status' : 'alert'} className={`flex items-center gap-2 rounded-xl p-4 text-sm border ${msg.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
          {msg.ok && <CheckCircle2 className="w-5 h-5" aria-hidden="true" />} {msg.text}
        </div>
      )}

      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Profil Masjid</h2>
        <div>
          <label htmlFor="nama_masjid" className={label}>Nama masjid</label>
          <input id="nama_masjid" required className={input} value={form.nama_masjid} onChange={e => set('nama_masjid', e.target.value)} />
        </div>
        <div>
          <label htmlFor="tagline" className={label}>Tagline singkat</label>
          <input id="tagline" className={input} maxLength={160} value={form.tagline_masjid} onChange={e => set('tagline_masjid', e.target.value)} />
        </div>
        <div>
          <label htmlFor="deskripsi" className={label}>Deskripsi masjid</label>
          <textarea id="deskripsi" rows={5} className={input} value={form.deskripsi_masjid} onChange={e => set('deskripsi_masjid', e.target.value)} />
        </div>
        <div>
          <label htmlFor="alamat" className={label}>Alamat lengkap</label>
          <textarea id="alamat" rows={2} className={input} value={form.alamat_masjid} onChange={e => set('alamat_masjid', e.target.value)} />
        </div>
        <div>
          <label htmlFor="maps" className={label}>Tautan Google Maps <span className="font-normal text-gray-500">(opsional, diawali https://)</span></label>
          <input id="maps" type="url" className={input} value={form.link_maps} onChange={e => set('link_maps', e.target.value)} placeholder="https://maps.app.goo.gl/..." />
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Kegiatan Rutin</h2>
          <button type="button" onClick={() => set('kegiatan_rutin', [...form.kegiatan_rutin, { nama: '', jadwal: '', deskripsi: '' }])} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-medium hover:bg-emerald-100 min-h-[44px]">
            <Plus className="w-4 h-4" aria-hidden="true" /> Tambah
          </button>
        </div>
        {form.kegiatan_rutin.length === 0 && <p className="text-sm text-gray-500">Belum ada kegiatan. Klik “Tambah”.</p>}
        {form.kegiatan_rutin.map((k, i) => (
          <fieldset key={i} className="rounded-xl border border-gray-200 p-4 space-y-3">
            <legend className="px-2 text-sm font-medium text-gray-700">Kegiatan {i + 1}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`k-nama-${i}`} className={label}>Nama kegiatan</label>
                <input id={`k-nama-${i}`} required className={input} value={k.nama} onChange={e => setKegiatan(i, { nama: e.target.value })} />
              </div>
              <div>
                <label htmlFor={`k-jadwal-${i}`} className={label}>Jadwal</label>
                <input id={`k-jadwal-${i}`} className={input} value={k.jadwal} onChange={e => setKegiatan(i, { jadwal: e.target.value })} placeholder="Setiap Ahad, 06.00 WIB" />
              </div>
            </div>
            <div>
              <label htmlFor={`k-desk-${i}`} className={label}>Deskripsi singkat</label>
              <textarea id={`k-desk-${i}`} rows={2} className={input} value={k.deskripsi} onChange={e => setKegiatan(i, { deskripsi: e.target.value })} />
            </div>
            <button type="button" onClick={() => set('kegiatan_rutin', form.kegiatan_rutin.filter((_, idx) => idx !== i))} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-700 hover:bg-rose-50 min-h-[44px]">
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Hapus kegiatan
            </button>
          </fieldset>
        ))}
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Kontak & Infaq</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="nama_admin" className={label}>Nama kontak admin</label>
            <input id="nama_admin" className={input} value={form.nama_admin} onChange={e => set('nama_admin', e.target.value)} />
          </div>
          <div>
            <label htmlFor="wa" className={label}>Nomor WhatsApp admin</label>
            <input id="wa" required inputMode="tel" className={input} value={form.wa_admin} onChange={e => set('wa_admin', e.target.value)} placeholder="08xxxxxxxxxx atau 628xxxxxxxxx" />
            <p className="mt-1 text-xs text-gray-500">Tombol di laman publik akan membuka chat ke nomor ini.</p>
          </div>
        </div>
        <div>
          <label htmlFor="rek" className={label}>Rekening tujuan infaq & sedekah</label>
          <textarea id="rek" rows={2} className={input} value={form.rekening_infaq} onChange={e => set('rekening_infaq', e.target.value)} placeholder="BSI 1234567890 a.n. Masjid ..." />
        </div>
      </section>

      <div className="sticky bottom-4">
        <button type="submit" disabled={saving} className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 disabled:opacity-60 min-h-[52px]">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Save className="w-5 h-5" aria-hidden="true" />} Simpan & Terbitkan
        </button>
      </div>
    </form>
  );
}
