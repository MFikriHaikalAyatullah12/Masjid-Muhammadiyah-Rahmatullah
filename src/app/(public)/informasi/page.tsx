import type { Metadata } from 'next';
import { MapPin, CalendarDays, ExternalLink } from 'lucide-react';
import KasSummary from '@/components/public/KasSummary';
import { getSiteSettings, getRingkasanKas } from '@/lib/public-site';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Informasi Masjid' };

export default async function InformasiPage() {
  const [site, kas] = await Promise.all([getSiteSettings(), getRingkasanKas()]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Informasi</p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl font-semibold text-slate-900">Profil {site.nama_masjid}</h1>
        <p className="mt-5 text-slate-700 leading-relaxed whitespace-pre-line">
          {site.deskripsi_masjid || 'Deskripsi masjid belum diisi oleh admin.'}
        </p>
      </header>

      <section aria-labelledby="judul-alamat" className="mt-10 rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-200">
        <h2 id="judul-alamat" className="font-heading text-xl font-semibold text-slate-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-700" aria-hidden="true" /> Alamat
        </h2>
        <p className="mt-3 text-slate-700 leading-relaxed">{site.alamat_masjid || 'Alamat belum diisi.'}</p>
        {site.link_maps && (
          <a
            href={site.link_maps}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100 min-h-[44px] hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            Buka di Google Maps <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </section>

      <section aria-labelledby="judul-kegiatan" className="mt-10">
        <h2 id="judul-kegiatan" className="font-heading text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-emerald-700" aria-hidden="true" /> Kegiatan Rutin Panitia Masjid
        </h2>
        {site.kegiatan_rutin.length === 0 ? (
          <p className="mt-4 text-slate-600">Belum ada kegiatan yang ditambahkan.</p>
        ) : (
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {site.kegiatan_rutin.map((k, i) => (
              <li key={i} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 border-t-4 border-emerald-600">
                <p className="font-heading text-lg font-semibold text-slate-900">{k.nama}</p>
                {k.jadwal && <p className="mt-1 text-sm font-medium text-amber-700">{k.jadwal}</p>}
                {k.deskripsi && <p className="mt-2 text-sm text-slate-600 leading-relaxed">{k.deskripsi}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="judul-transparansi" className="mt-14">
        <h2 id="judul-transparansi" className="font-heading text-2xl font-semibold text-slate-900">Transparansi Keuangan</h2>
        <p className="mt-2 text-slate-600">Ringkasan pemasukan, pengeluaran, dan posisi kas masjid saat ini.</p>
        <div className="mt-6">
          <KasSummary data={kas} compact />
        </div>
      </section>
    </div>
  );
}
