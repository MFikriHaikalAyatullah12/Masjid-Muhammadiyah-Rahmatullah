import type { Metadata } from 'next';
import { Landmark, ShieldCheck, Clock3 } from 'lucide-react';
import InfaqForm from '@/components/public/InfaqForm';
import { getSiteSettings } from '@/lib/public-site';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Infaq & Sedekah' };

export default async function InfaqPage() {
  const site = await getSiteSettings();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Infaq &amp; Sedekah</p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl font-semibold text-slate-900">Konfirmasi Infaq, Zakat &amp; Tabungan</h1>
        <p className="mt-4 text-slate-700 leading-relaxed">
          Setelah transfer, pilih kategori (infaq/sedekah, zakat fitrah, zakat mal, donatur bulanan, atau tabungan qurban) dan isi
          formulir ini. Admin memverifikasi bukti transfer, lalu sumbangan Anda otomatis tercatat pada kategori yang sesuai.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <aside className="lg:col-span-2 space-y-4">
          <section aria-labelledby="judul-rekening" className="rounded-2xl bg-emerald-900 p-6 text-white shadow-lg">
            <h2 id="judul-rekening" className="font-heading text-lg font-semibold flex items-center gap-2">
              <Landmark className="h-5 w-5 text-amber-300" aria-hidden="true" /> Rekening Tujuan
            </h2>
            <p className="mt-3 text-lg leading-relaxed whitespace-pre-line break-words">
              {site.rekening_infaq || 'Rekening belum diisi oleh admin.'}
            </p>
          </section>
          <ol className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 space-y-4 text-sm text-slate-700">
            <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">1</span><span>Transfer ke rekening di atas.</span></li>
            <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">2</span><span>Pilih kategori, isi nama, tanggal, nominal, dan unggah bukti transfer. Gambar dikompres otomatis di perangkat Anda.</span></li>
            <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">3</span><span>Admin memverifikasi, lalu sumbangan tercatat di kategori yang sesuai dan kas masjid.</span></li>
          </ol>
          <div className="flex flex-col gap-3 text-sm text-slate-600">
            <p className="flex items-start gap-2"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" /> Data Anda hanya digunakan untuk pencatatan kas masjid.</p>
            <p className="flex items-start gap-2"><Clock3 className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" /> Verifikasi biasanya selesai dalam 1x24 jam.</p>
          </div>
        </aside>

        <section aria-labelledby="judul-form" className="lg:col-span-3 rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-200">
          <h2 id="judul-form" className="font-heading text-xl font-semibold text-slate-900">Formulir Konfirmasi</h2>
          <InfaqForm />
        </section>
      </div>
    </div>
  );
}
