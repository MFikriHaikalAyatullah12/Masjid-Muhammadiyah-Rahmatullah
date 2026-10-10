'use client';

import { useId, useRef, useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, ImageIcon, X } from 'lucide-react';
import { compressImage, formatBytes, type CompressedImage } from '@/lib/image-compress';
import { formatRupiah, parseRupiah } from '@/lib/currency';
import { KATEGORI_SUMBANGAN, KATEGORI_LIST, JENIS_HARTA, JENIS_HEWAN, NAMA_BULAN, type KategoriSumbangan } from '@/lib/sumbangan';

const today = () => new Date().toISOString().split('T')[0];
const now = new Date();

type Status = { type: 'idle' } | { type: 'error'; message: string } | { type: 'success'; id: number; kategori: KategoriSumbangan };

export default function InfaqForm() {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kategori, setKategori] = useState<KategoriSumbangan>('infaq');
  const [nama, setNama] = useState('');
  const [telp, setTelp] = useState('');
  const [jenis, setJenis] = useState<'infaq' | 'sedekah'>('infaq');
  const [tanggal, setTanggal] = useState(today());
  const [nominal, setNominal] = useState('');
  const [catatan, setCatatan] = useState('');
  const [jumlahJiwa, setJumlahJiwa] = useState('1');
  const [jenisHarta, setJenisHarta] = useState<(typeof JENIS_HARTA)[number]>('uang');
  const [nilaiHarta, setNilaiHarta] = useState('');
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [jenisHewan, setJenisHewan] = useState<(typeof JENIS_HEWAN)[number]>('kambing');
  const [targetTabungan, setTargetTabungan] = useState('');
  const [bukti, setBukti] = useState<CompressedImage | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>({ type: 'idle' });

  const handleFile = async (file: File | undefined) => {
    setFileError('');
    setBukti(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFileError('File harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFileError('Ukuran gambar maksimal 15 MB.');
      return;
    }
    setCompressing(true);
    try {
      setBukti(await compressImage(file));
    } catch (e: any) {
      setFileError(e.message || 'Gagal memproses gambar.');
    } finally {
      setCompressing(false);
    }
  };

  const reset = () => {
    setNama(''); setTelp(''); setJenis('infaq'); setTanggal(today());
    setNominal(''); setCatatan(''); setBukti(null); setFileError('');
    setJumlahJiwa('1'); setNilaiHarta(''); setTargetTabungan('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const buildDetail = () => {
    switch (kategori) {
      case 'zakat_fitrah': return { jumlah_jiwa: parseInt(jumlahJiwa, 10) || 1 };
      case 'zakat_mal': return { jenis_harta: jenisHarta, ...(parseRupiah(nilaiHarta) > 0 ? { nilai_harta: parseRupiah(nilaiHarta) } : {}) };
      case 'donatur_bulanan': return { bulan, tahun };
      case 'tabungan_qurban': return { jenis_hewan: jenisHewan, ...(parseRupiah(targetTabungan) > 0 ? { target_tabungan: parseRupiah(targetTabungan) } : {}) };
      default: return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'idle' });
    const nominalNum = parseRupiah(nominal);
    if (nominalNum <= 0) {
      setStatus({ type: 'error', message: 'Nominal harus lebih dari 0.' });
      return;
    }
    if (kategori === 'zakat_fitrah' && (parseInt(jumlahJiwa, 10) || 0) < 1) {
      setStatus({ type: 'error', message: 'Jumlah jiwa minimal 1.' });
      return;
    }
    if (!bukti) {
      setFileError('Bukti transfer wajib diunggah.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/public/infaq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama, no_telepon: telp, kategori, jenis, detail: buildDetail(), tanggal, nominal: nominalNum, catatan, bukti: bukti.dataUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ type: 'error', message: data.error || 'Gagal mengirim. Silakan coba lagi.' });
        return;
      }
      setStatus({ type: 'success', id: data.id, kategori });
      reset();
    } catch {
      setStatus({ type: 'error', message: 'Koneksi bermasalah. Silakan coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  };

  const input = 'mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 min-h-[48px] focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100';
  const label = 'block text-sm font-medium text-slate-800';

  if (status.type === 'success') {
    return (
      <div role="status" className="mt-6 rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <p className="font-heading text-lg font-semibold text-emerald-900">Jazakumullahu khairan, konfirmasi terkirim.</p>
            <p className="mt-1 text-sm text-slate-700">
              Nomor konfirmasi <span className="font-semibold">#{status.id}</span> · {KATEGORI_SUMBANGAN[status.kategori].label}. Admin akan memverifikasi bukti transfer Anda,
              setelah itu sumbangan tercatat di kas masjid.
            </p>
            <button
              type="button"
              onClick={() => setStatus({ type: 'idle' })}
              className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 min-h-[44px] hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            >
              Kirim konfirmasi lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
      {status.type === 'error' && (
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> {status.message}
        </div>
      )}

      <fieldset>
        <legend className={label}>Kategori sumbangan <span className="text-rose-600" aria-hidden="true">*</span></legend>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-2" role="radiogroup">
          {KATEGORI_LIST.map(k => (
            <label key={k} className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 min-h-[48px] transition-colors duration-150 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-emerald-100 ${kategori === k ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}>
              <input type="radio" name="kategori" value={k} checked={kategori === k} onChange={() => setKategori(k)} className="sr-only" />
              <span className={`text-sm font-semibold ${kategori === k ? 'text-emerald-900' : 'text-slate-800'}`}>{KATEGORI_SUMBANGAN[k].label}</span>
              <span className="text-xs text-slate-500">{KATEGORI_SUMBANGAN[k].deskripsi}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${id}-nama`} className={label}>Nama lengkap <span className="text-rose-600" aria-hidden="true">*</span></label>
        <input id={`${id}-nama`} name="nama" required minLength={2} maxLength={100} autoComplete="name" value={nama} onChange={e => setNama(e.target.value)} className={input} placeholder={kategori === 'infaq' ? "Nama Anda atau 'Hamba Allah'" : 'Nama sesuai data di masjid'} suppressHydrationWarning />
        {(kategori === 'donatur_bulanan' || kategori === 'tabungan_qurban') && (
          <p className="mt-1 text-xs text-slate-500">Gunakan nama/nomor WA yang sama seperti terdaftar agar setoran tersambung ke data Anda.</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-telp`} className={label}>Nomor WhatsApp <span className="font-normal text-slate-500">(opsional)</span></label>
          <input id={`${id}-telp`} name="telp" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={telp} onChange={e => setTelp(e.target.value)} className={input} placeholder="08xxxxxxxxxx" suppressHydrationWarning />
        </div>
        {kategori === 'infaq' && (
        <fieldset>
          <legend className={label}>Jenis</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup">
            {(['infaq', 'sedekah'] as const).map(j => (
              <label key={j} className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium capitalize min-h-[48px] transition-colors duration-150 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-emerald-100 ${jenis === j ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                <input type="radio" name="jenis" value={j} checked={jenis === j} onChange={() => setJenis(j)} className="sr-only" />
                {j}
              </label>
            ))}
          </div>
        </fieldset>
        )}
        {kategori === 'zakat_fitrah' && (
          <div>
            <label htmlFor={`${id}-jiwa`} className={label}>Jumlah jiwa <span className="text-rose-600" aria-hidden="true">*</span></label>
            <input id={`${id}-jiwa`} type="number" inputMode="numeric" min={1} max={100} required value={jumlahJiwa} onChange={e => setJumlahJiwa(e.target.value)} className={input} suppressHydrationWarning />
          </div>
        )}
        {kategori === 'zakat_mal' && (
          <div>
            <label htmlFor={`${id}-harta`} className={label}>Jenis harta <span className="text-rose-600" aria-hidden="true">*</span></label>
            <select id={`${id}-harta`} value={jenisHarta} onChange={e => setJenisHarta(e.target.value as typeof jenisHarta)} className={`${input} capitalize`} suppressHydrationWarning>
              {JENIS_HARTA.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        )}
        {kategori === 'donatur_bulanan' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={`${id}-bulan`} className={label}>Bulan <span className="text-rose-600" aria-hidden="true">*</span></label>
              <select id={`${id}-bulan`} value={bulan} onChange={e => setBulan(Number(e.target.value))} className={input} suppressHydrationWarning>
                {NAMA_BULAN.map((b, i) => <option key={b} value={i + 1}>{b}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-tahun`} className={label}>Tahun</label>
              <input id={`${id}-tahun`} type="number" min={2020} max={2100} value={tahun} onChange={e => setTahun(Number(e.target.value))} className={input} suppressHydrationWarning />
            </div>
          </div>
        )}
        {kategori === 'tabungan_qurban' && (
          <div>
            <label htmlFor={`${id}-hewan`} className={label}>Hewan qurban <span className="text-rose-600" aria-hidden="true">*</span></label>
            <select id={`${id}-hewan`} value={jenisHewan} onChange={e => setJenisHewan(e.target.value as typeof jenisHewan)} className={`${input} capitalize`} suppressHydrationWarning>
              {JENIS_HEWAN.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        )}
      </div>

      {kategori === 'zakat_mal' && (
        <div>
          <label htmlFor={`${id}-nilai`} className={label}>Total nilai harta (Rp) <span className="font-normal text-slate-500">(opsional)</span></label>
          <input id={`${id}-nilai`} inputMode="numeric" value={nilaiHarta} onChange={e => setNilaiHarta(formatRupiah(e.target.value))} className={`${input} tabular-nums`} placeholder="contoh: 100.000.000" suppressHydrationWarning />
        </div>
      )}
      {kategori === 'tabungan_qurban' && (
        <div>
          <label htmlFor={`${id}-target`} className={label}>Target tabungan (Rp) <span className="font-normal text-slate-500">(isi jika baru pertama kali menabung)</span></label>
          <input id={`${id}-target`} inputMode="numeric" value={targetTabungan} onChange={e => setTargetTabungan(formatRupiah(e.target.value))} className={`${input} tabular-nums`} placeholder="contoh: 3.500.000" suppressHydrationWarning />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-tanggal`} className={label}>Tanggal transfer <span className="text-rose-600" aria-hidden="true">*</span></label>
          <input id={`${id}-tanggal`} name="tanggal" type="date" required max={today()} value={tanggal} onChange={e => setTanggal(e.target.value)} className={input} suppressHydrationWarning />
        </div>
        <div>
          <label htmlFor={`${id}-nominal`} className={label}>{kategori === 'zakat_fitrah' ? 'Total dibayar (Rp)' : 'Nominal (Rp)'} <span className="text-rose-600" aria-hidden="true">*</span></label>
          <input id={`${id}-nominal`} name="nominal" inputMode="numeric" required value={nominal} onChange={e => setNominal(formatRupiah(e.target.value))} className={`${input} tabular-nums`} placeholder="contoh: 100.000" suppressHydrationWarning />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-catatan`} className={label}>Catatan / doa <span className="font-normal text-slate-500">(opsional)</span></label>
        <textarea id={`${id}-catatan`} name="catatan" rows={2} maxLength={500} value={catatan} onChange={e => setCatatan(e.target.value)} className={input} placeholder="Misal: untuk pembangunan tempat wudhu" suppressHydrationWarning />
      </div>

      <div>
        <span className={label} id={`${id}-bukti-label`}>Bukti transfer <span className="text-rose-600" aria-hidden="true">*</span></span>
        <p id={`${id}-bukti-help`} className="text-xs text-slate-500 mt-0.5">JPG, PNG, atau WebP. Gambar dikompres otomatis sebelum dikirim.</p>
        <input
          ref={fileRef}
          id={`${id}-bukti`}
          name="bukti"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-labelledby={`${id}-bukti-label`}
          aria-describedby={`${id}-bukti-help ${fileError ? `${id}-bukti-err` : ''}`}
          onChange={e => handleFile(e.target.files?.[0])}
          className="sr-only"
        />
        {!bukti && (
          <label
            htmlFor={`${id}-bukti`}
            className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors duration-150 hover:bg-emerald-50 ${fileError ? 'border-rose-300' : 'border-slate-300'}`}
          >
            {compressing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-emerald-700" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700">Mengompres gambar…</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-emerald-700" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-800">Ketuk untuk pilih gambar / foto</span>
                <span className="text-xs text-slate-500">atau ambil foto langsung dari kamera</span>
              </>
            )}
          </label>
        )}
        {bukti && (
          <div className="mt-2 flex items-center gap-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <img src={bukti.dataUrl} alt="Pratinjau bukti transfer" className="h-20 w-20 rounded-lg object-cover ring-1 ring-slate-200" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="flex items-center gap-1.5 font-medium text-emerald-800"><ImageIcon className="h-4 w-4" aria-hidden="true" /> Siap dikirim</p>
              <p className="text-slate-600 text-xs mt-0.5">
                {formatBytes(bukti.originalSize)} → <span className="font-semibold">{formatBytes(bukti.size)}</span> · {bukti.width}×{bukti.height}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setBukti(null); if (fileRef.current) fileRef.current.value = ''; }}
              aria-label="Hapus gambar"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
        {fileError && <p id={`${id}-bukti-err`} role="alert" className="mt-1.5 text-sm text-rose-700">{fileError}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting || compressing}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 font-semibold text-white min-h-[52px] shadow-sm hover:bg-emerald-800 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
        suppressHydrationWarning
      >
        {submitting ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Mengirim…</> : 'Kirim Konfirmasi'}
      </button>
    </form>
  );
}
