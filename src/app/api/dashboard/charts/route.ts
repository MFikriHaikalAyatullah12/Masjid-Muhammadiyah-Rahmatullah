import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export async function GET(request: NextRequest) {
  try {
    // Use requireAuth instead of getUserFromToken for consistent error handling
    const user = await requireAuth();

    const client = await pool.connect();

    try {
      // Generate 6 months data
      const endDate = new Date();
      const startDate = subMonths(endDate, 5);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });

      // Monthly stats for line chart
      const monthlyStats = [];
      
      for (const month of months) {
        const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
        const monthName = format(month, 'MMM yyyy', { locale: localeId });

        // Get pemasukan (kas_harian masuk + zakat + donasi)
        const pemasukanQuery = `
          SELECT 
            COALESCE(SUM(jumlah), 0) as total_kas_masuk
          FROM kas_harian 
          WHERE user_id = $1 
            AND tanggal BETWEEN $2 AND $3 
            AND jenis_transaksi = 'masuk'
        `;
        const pemasukanResult = await client.query(pemasukanQuery, [user.userId, monthStart, monthEnd]);
        
        // Get zakat fitrah dan mal
        const zakatFitrahQuery = `
          SELECT COALESCE(SUM(total_rupiah), 0) as total 
          FROM zakat_fitrah 
          WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
        `;
        const zakatFitrahResult = await client.query(zakatFitrahQuery, [user.userId, monthStart, monthEnd]);
        
        const zakatMalQuery = `
          SELECT COALESCE(SUM(jumlah_zakat), 0) as total 
          FROM zakat_mal 
          WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
        `;
        const zakatMalResult = await client.query(zakatMalQuery, [user.userId, monthStart, monthEnd]);

        // Get pengeluaran (kas_harian keluar + pengeluaran)
        const pengeluaranKasQuery = `
          SELECT 
            COALESCE(SUM(jumlah), 0) as total_kas_keluar
          FROM kas_harian 
          WHERE user_id = $1 
            AND tanggal BETWEEN $2 AND $3 
            AND jenis_transaksi = 'keluar'
        `;
        const pengeluaranKasResult = await client.query(pengeluaranKasQuery, [user.userId, monthStart, monthEnd]);
        
        const pengeluaranQuery = `
          SELECT COALESCE(SUM(jumlah), 0) as total 
          FROM pengeluaran 
          WHERE user_id = $1 AND tanggal BETWEEN $2 AND $3
        `;
        const pengeluaranResult = await client.query(pengeluaranQuery, [user.userId, monthStart, monthEnd]);

        const totalPemasukan = 
          parseFloat(pemasukanResult.rows[0].total_kas_masuk) +
          parseFloat(zakatFitrahResult.rows[0].total) +
          parseFloat(zakatMalResult.rows[0].total);

        const totalPengeluaran = 
          parseFloat(pengeluaranKasResult.rows[0].total_kas_keluar) +
          parseFloat(pengeluaranResult.rows[0].total);

        monthlyStats.push({
          bulan: monthName,
          pemasukan: totalPemasukan,
          pengeluaran: totalPengeluaran
        });
      }

      // Category stats for pie chart (last 30 days) - Gabungkan semua kategori
      const last30Days = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
      const today = format(new Date(), 'yyyy-MM-dd');

      // Ambil kategori dari semua tabel
      const allCategoriesQuery = `
        -- Kategori dari kas_harian keluar
        SELECT 'Kas ' || kategori as kategori, SUM(jumlah) as total
        FROM kas_harian 
        WHERE user_id = $1 AND tanggal BETWEEN $2 AND $3
          AND jenis_transaksi = 'keluar'
          AND kategori IS NOT NULL AND kategori != ''
        GROUP BY kategori
        
        UNION ALL
        
        -- Kategori dari pengeluaran
        SELECT kategori, SUM(jumlah) as total
        FROM pengeluaran 
        WHERE user_id = $1 AND tanggal BETWEEN $2 AND $3
          AND kategori IS NOT NULL AND kategori != ''
        GROUP BY kategori
        
        UNION ALL
        
        -- Zakat Fitrah (pemasukan)
        SELECT 'Zakat Fitrah' as kategori, SUM(total_rupiah) as total
        FROM zakat_fitrah 
        WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
        
        UNION ALL
        
        -- Zakat Mal (pemasukan)
        SELECT 'Zakat Mal' as kategori, SUM(jumlah_zakat) as total
        FROM zakat_mal 
        WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
        
        UNION ALL
        
        -- Donatur Bulanan pembayaran (pemasukan)
        SELECT 'Donatur Bulanan' as kategori, 
               COALESCE(SUM(pd.jumlah), 0) as total
        FROM pembayaran_donatur pd
        JOIN donatur_bulanan db ON pd.donatur_id = db.id
        WHERE db.user_id = $1 AND pd.tanggal_bayar BETWEEN $2 AND $3
      `;
      
      const allCategoriesResult = await client.query(allCategoriesQuery, [user.userId, last30Days, today]);
      
      // Group dan aggregate data
      const categoryMap = new Map();
      
      allCategoriesResult.rows.forEach(row => {
        const kategori = row.kategori;
        const total = parseFloat(row.total) || 0;
        
        if (total > 0) { // Hanya tampilkan yang ada nilainya
          if (categoryMap.has(kategori)) {
            categoryMap.set(kategori, categoryMap.get(kategori) + total);
          } else {
            categoryMap.set(kategori, total);
          }
        }
      });

      // Convert ke array dan hitung persentase
      const categoryArray = Array.from(categoryMap.entries()).map(([kategori, total]) => ({
        kategori,
        total
      }));

      // Sort by total descending
      categoryArray.sort((a, b) => b.total - a.total);

      const totalAllCategories = categoryArray.reduce((sum, item) => sum + item.total, 0);
      
      const categoryStats = categoryArray.map(item => {
        const persentase = totalAllCategories > 0 ? Math.round((item.total / totalAllCategories) * 100) : 0;
        return {
          kategori: item.kategori,
          total: item.total,
          persentase: persentase
        };
      });

      // Jika tidak ada data, tambahkan placeholder
      if (categoryStats.length === 0) {
        categoryStats.push({
          kategori: 'Tidak ada data',
          total: 0,
          persentase: 100
        });
      }

      const response = {
        monthlyStats,
        categoryStats
      };

      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching chart data:', error);
    
    // Handle authentication errors
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: 'Unable to connect to database'
        },
        { status: 503 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Gagal mengambil data chart',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}