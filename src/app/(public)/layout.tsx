import type { Metadata } from 'next';
import { Lexend, Source_Sans_3 } from 'next/font/google';
import PublicNav from '@/components/public/PublicNav';
import PublicFooter from '@/components/public/PublicFooter';
import { getSiteSettings } from '@/lib/public-site';

const lexend = Lexend({ subsets: ['latin'], variable: '--font-heading', weight: ['400', '500', '600', '700'] });
const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600', '700'] });

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: { default: site.nama_masjid, template: `%s | ${site.nama_masjid}` },
    description: site.tagline_masjid || site.deskripsi_masjid.slice(0, 160),
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  return (
    <div className={`${lexend.variable} ${sourceSans.variable} public-site min-h-screen flex flex-col`}>
      <a href="#konten" className="skip-link">Lewati ke konten utama</a>
      <PublicNav namaMasjid={site.nama_masjid} />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <PublicFooter site={site} />
    </div>
  );
}
