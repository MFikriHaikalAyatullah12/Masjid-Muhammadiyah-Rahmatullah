import Link from 'next/link';
import { MapPin, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '@/lib/public-site';
import { normalizeWa } from '@/lib/public-site';

export default function PublicFooter({ site }: { site: SiteSettings }) {
  const wa = normalizeWa(site.wa_admin);
  return (
    <footer className="mt-16 border-t border-emerald-100 bg-emerald-950 text-emerald-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-semibold">{site.nama_masjid}</p>
          {site.tagline_masjid && <p className="mt-2 text-sm text-emerald-200 leading-relaxed">{site.tagline_masjid}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Alamat</p>
          <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
            <span>{site.alamat_masjid || 'Alamat belum diisi'}</span>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Kontak</p>
          {wa ? (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 rounded"
            >
              <MessageCircle className="h-4 w-4 text-amber-400" aria-hidden="true" />
              WhatsApp {site.nama_admin || 'Admin'}
            </a>
          ) : (
            <p className="mt-3 text-sm text-emerald-200">Nomor admin belum diisi</p>
          )}
          <nav aria-label="Tautan footer" className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-emerald-200">
            <Link href="/informasi" className="hover:text-white">Informasi</Link>
            <Link href="/infaq" className="hover:text-white">Infaq & Sedekah</Link>
            <Link href="/login" className="hover:text-white">Masuk Admin</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-emerald-900 py-4 text-center text-xs text-emerald-300">
        © {new Date().getFullYear()} {site.nama_masjid}. Dikelola secara amanah dan transparan.
      </div>
    </footer>
  );
}
