import Link from 'next/link';
import { ArrowRight, CalendarDays, MessageCircle, ShieldCheck, HandCoins } from 'lucide-react';
import KasSummary from '@/components/public/KasSummary';
import { getSiteSettings, getRingkasanKas, normalizeWa } from '@/lib/public-site';

export const dynamic = 'force-dynamic';

export default async function BerandaPage() {
  const [site, kas] = await Promise.all([getSiteSettings(), getRingkasanKas()]);
  const wa = normalizeWa(site.wa_admin);
  const kegiatan = site.kegiatan_rutin.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_40%),radial-gradient(circle_at_80%_0%,white_0,transparent_35%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
            <ShieldCheck className="h-4 w-4 text-amber-300" aria-hidden="true" />
            Keuangan dikelola transparan &amp; amanah
          </p>
          <h1 className="mt-5 font-heading text-3xl sm:text-5xl font-semibold leading-tight text-balance max-w-3xl">
            {site.nama_masjid}
          </h1>
          {site.tagline_masjid && (
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-emerald-100 leading-relaxed">{site.tagline_masjid}</p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/infaq"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 font-semibold text-slate-900 min-h-[48px] shadow-lg shadow-amber-900/20 hover:bg-amber-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              <HandCoins className="h-5 w-5" aria-hidden="true" />
              Salurkan Infaq &amp; Sedekah
            </Link>
            <Link
              href="/informasi"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 font-semibold text-white ring-1 ring-white/30 min-h-[48px] hover:bg-white/20 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
            >
              Tentang Masjid
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ringkasan kas - overlap hero */}
      <div className="relative -mt-10 sm:-mt-14">
        <KasSummary data={kas} />
        <p className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-3 text-xs text-slate-500">
          Angka di atas diperbarui otomatis dari pembukuan kas harian masjid.
        </p>
      </div>

      {/* Tentang singkat */}
      <section aria-labelledby="judul-tentang" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-16 grid gap-10 lg:grid-cols-5 items-start">
        <div className="lg:col-span-3">
          <h2 id="judul-tentang" className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900">Tentang Masjid</h2>
          <p className="mt-4 text-slate-700 leading-relaxed whitespace-pre-line">
            {site.deskripsi_masjid || 'Deskripsi masjid belum diisi oleh admin.'}
          </p>
          <Link href="/informasi" className="mt-5 inline-flex items-center gap-2 font-medium text-emerald-800 underline-offset-4 hover:underline min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 rounded">
            Selengkapnya <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="lg:col-span-2 rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-100">
          <h3 className="font-heading text-lg font-semibold text-emerald-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5" aria-hidden="true" /> Kegiatan Rutin
          </h3>
          {kegiatan.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Belum ada kegiatan yang ditambahkan.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {kegiatan.map((k, i) => (
                <li key={i} className="border-l-2 border-amber-400 pl-4">
                  <p className="font-medium text-slate-900">{k.nama}</p>
                  {k.jadwal && <p className="text-sm text-emerald-800">{k.jadwal}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CTA kontak */}
      <section aria-labelledby="judul-kontak" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-3xl bg-slate-900 px-6 py-10 sm:px-10 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 id="judul-kontak" className="font-heading text-2xl font-semibold">Ada pertanyaan atau ingin berkontribusi?</h2>
            <p className="mt-2 text-slate-300">Hubungi {site.nama_admin || 'admin masjid'} langsung melalui WhatsApp.</p>
          </div>
          {wa ? (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-white min-h-[48px] hover:bg-emerald-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> Chat WhatsApp
            </a>
          ) : (
            <Link href="/kontak" className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold min-h-[48px]">Lihat Kontak</Link>
          )}
        </div>
      </section>
    </>
  );
}
