import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';
import { format, eachMonthOfInterval, subMonths, startOfMonth } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

// Semua pemasukan/pengeluaran (manual maupun sumbangan online yang disetujui)
// bermuara di kas_harian, sehingga grafik dibaca dari satu sumber itu.

const LABEL_KATEGORI: Record<string, string> = {
  zakat_fitrah: 'Zakat Fitrah',
  zakat_mal: 'Zakat Mal',
  infaq: 'Infaq',
  sedekah: 'Sedekah',
  donasi: 'Donasi',
  donatur_bulanan: 'Donatur Bulanan',
  tabungan_qurban: 'Tabungan Qurban',
  sumbangan: 'Sumbangan',
  distribusi_zakat: 'Distribusi Zakat',
  operasional: 'Operasional',
  program_masjid: 'Program Masjid',
  lainnya: 'Lainnya',
};

const label = (k: string) =>
  LABEL_KATEGORI[k] || k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function withPercent(rows: { kategori: string; total: number }[]) {
  const sum = rows.reduce((s, r) => s + r.total, 0);
  if (sum === 0) return [];
  const stats = rows.map(r => ({
    ...r,
    persentase: Math.max(1, Math.round((r.total / sum) * 100)),
  }));
  // Pastikan jumlah persentase tepat 100 setelah pembulatan
  const over = stats.reduce((s, r) => s + r.persentase, 0) - 100;
  if (over !== 0 && stats.length) {
    const idx = stats.reduce((m, r, i, a) => (r.persentase > a[m].persentase ? i : m), 0);
    stats[idx].persentase -= over;
  }
  return stats;
}

const MONTHS = 6;

function emptyMonths() {
  const end = startOfMonth(new Date());
  return eachMonthOfInterval({ start: subMonths(end, MONTHS - 1), end }).map(m => ({
    key: format(m, 'yyyy-MM'),
    bulan: format(m, 'MMM yyyy', { locale: localeId }),
    pemasukan: 0,
    pengeluaran: 0,
  }));
}

export async function GET() {
  try {
    const user = await requireAuth();
    const months = emptyMonths();
    const since = `${months[0].key}-01`;

    const [monthly, income, expense] = await Promise.all([
      pool.query(
        `SELECT to_char(date_trunc('month', tanggal), 'YYYY-MM') AS key,
                COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk' THEN jumlah END), 0) AS pemasukan,
                COALESCE(SUM(CASE WHEN jenis_transaksi = 'keluar' THEN jumlah END), 0) AS pengeluaran
         FROM kas_harian
         WHERE user_id = $1 AND tanggal >= $2
         GROUP BY 1`,
        [user.userId, since]
      ),
      pool.query(
        `SELECT kategori, SUM(jumlah) AS total
         FROM kas_harian
         WHERE user_id = $1 AND jenis_transaksi = 'masuk' AND tanggal >= $2
         GROUP BY kategori HAVING SUM(jumlah) > 0 ORDER BY total DESC LIMIT 6`,
        [user.userId, since]
      ),
      pool.query(
        `SELECT kategori, SUM(jumlah) AS total
         FROM kas_harian
         WHERE user_id = $1 AND jenis_transaksi = 'keluar' AND tanggal >= $2
         GROUP BY kategori HAVING SUM(jumlah) > 0 ORDER BY total DESC LIMIT 6`,
        [user.userId, since]
      ),
    ]);

    for (const row of monthly.rows) {
      const m = months.find(x => x.key === row.key);
      if (m) {
        m.pemasukan = parseFloat(row.pemasukan) || 0;
        m.pengeluaran = parseFloat(row.pengeluaran) || 0;
      }
    }

    const toRows = (rows: any[]) =>
      rows.map(r => ({ kategori: label(r.kategori || 'lainnya'), total: parseFloat(r.total) || 0 }));

    const monthlyStats = months.map(({ bulan, pemasukan, pengeluaran }) => ({ bulan, pemasukan, pengeluaran }));
    const totalIncome = monthlyStats.reduce((s, m) => s + m.pemasukan, 0);
    const totalExpense = monthlyStats.reduce((s, m) => s + m.pengeluaran, 0);

    return NextResponse.json(
      {
        monthlyStats,
        incomeStats: withPercent(toRows(income.rows)),
        categoryStats: withPercent(toRows(expense.rows)),
        summary: { totalIncome, totalExpense, netBalance: totalIncome - totalExpense },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dashboard charts error:', error);
    return NextResponse.json({
      monthlyStats: emptyMonths().map(({ bulan, pemasukan, pengeluaran }) => ({ bulan, pemasukan, pengeluaran })),
      incomeStats: [],
      categoryStats: [],
      summary: { totalIncome: 0, totalExpense: 0, netBalance: 0 },
    });
  }
}
