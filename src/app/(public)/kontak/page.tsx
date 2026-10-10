import type { Metadata } from 'next';
import { MessageCircle, Phone, MapPin, Clock } from 'lucide-react';
import { getSiteSettings, normalizeWa } from '@/lib/public-site';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Kontak Admin' };

function formatTampil(wa: string) {
  if (!wa) return '';
  const local = wa.startsWith('62') ? '0' + wa.slice(2) : wa;
  return local.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
}

export default async function KontakPage() {
  const site = await getSiteSettings();
  const wa = normalizeWa(site.wa_admin);
  const pesan = encodeURIComponent(`Assalamu'alaikum, saya ingin bertanya tentang ${site.nama_masjid}.`);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Kontak</p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl font-semibold text-slate-900">Hubungi Admin Masjid</h1>
        <p className="mt-4 text-slate-700 leading-relaxed">
          Klik nomor di bawah untuk langsung terhubung ke WhatsApp {site.nama_admin || 'admin'}.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="judul-wa" className="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-8 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="judul-wa" className="font-heading text-xl font-semibold">WhatsApp</h2>
              <p className="text-sm text-emerald-100">{site.nama_admin || 'Admin Masjid'}</p>
            </div>
          </div>
          {wa ? (
            <>
              <a
                href={`https://wa.me/${wa}?text=${pesan}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat WhatsApp ke nomor ${formatTampil(wa)}`}
                className="mt-6 block rounded-2xl bg-white px-6 py-5 text-center font-heading text-2xl sm:text-3xl font-semibold text-emerald-900 tabular-nums shadow hover:bg-emerald-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
              >
                {formatTampil(wa)}
              </a>
              <a
                href={`https://wa.me/${wa}?text=${pesan}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 font-semibold text-slate-900 min-h-[48px] hover:bg-amber-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> Buka WhatsApp
              </a>
              <a
                href={`tel:+${wa}`}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-medium ring-1 ring-white/30 min-h-[44px] hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> Telepon biasa
              </a>
            </>
          ) : (
            <p className="mt-6 rounded-2xl bg-white/10 p-5 text-emerald-100">Nomor admin belum diatur.</p>
          )}
        </section>

        <div className="space-y-6">
          <section aria-labelledby="judul-lokasi" className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 id="judul-lokasi" className="font-heading text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-700" aria-hidden="true" /> Lokasi
            </h2>
            <p className="mt-2 text-slate-700 leading-relaxed">{site.alamat_masjid || 'Alamat belum diisi.'}</p>
            {site.link_maps && (
              <a href={site.link_maps} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-sm font-medium text-emerald-800 underline-offset-4 hover:underline min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 rounded">
                Buka Google Maps
              </a>
            )}
          </section>
          <section aria-labelledby="judul-jam" className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-100">
            <h2 id="judul-jam" className="font-heading text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-700" aria-hidden="true" /> Catatan
            </h2>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              Pesan WhatsApp dibalas pada jam kerja panitia. Untuk konfirmasi infaq, Anda juga dapat mengisi
              formulir di halaman <a href="/infaq" className="font-medium text-emerald-800 underline underline-offset-4">Infaq &amp; Sedekah</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
