import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const client = await pool.connect();
    
    try {
      // Generate 3 months data for better performance
      const endDate = new Date();
      const startDate = subMonths(endDate, 2);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });

      const monthlyStats = [];
      
      for (const month of months) {
        const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
        const monthName = format(month, 'MMM yyyy', { locale: localeId });

        try {
          // Simple aggregated query
          const result = await client.query(`
            SELECT 
              COALESCE(
                (SELECT SUM(total_rupiah) FROM zakat_fitrah WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3), 0
              ) + COALESCE(
                (SELECT SUM(jumlah_zakat) FROM zakat_mal WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3), 0
              ) as total_pemasukan,
              COALESCE(
                (SELECT SUM(jumlah) FROM pengeluaran WHERE user_id = $1 AND tanggal BETWEEN $2 AND $3), 0
              ) as total_pengeluaran
          `, [user.userId, monthStart, monthEnd]);

          const row = result.rows[0];
          monthlyStats.push({
            bulan: monthName,
            pemasukan: parseFloat(row.total_pemasukan || 0),
            pengeluaran: parseFloat(row.total_pengeluaran || 0)
          });

        } catch (error) {
          // Handle month error gracefully
          monthlyStats.push({
            bulan: monthName,
            pemasukan: 0,
            pengeluaran: 0
          });
        }
      }

      // Get categories data
      let incomeCategories: any[] = [];
      let expenseCategories: any[] = [];
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const last30Days = format(subMonths(new Date(), 1), 'yyyy-MM-dd');

      try {
        // Simplified income categories
        const incomeResult = await client.query(`
          SELECT 'Zakat Mal' as kategori, COALESCE(SUM(jumlah_zakat), 0) as total
          FROM zakat_mal 
          WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
          
          UNION ALL
          
          SELECT 'Zakat Fitrah' as kategori, COALESCE(SUM(total_rupiah), 0) as total
          FROM zakat_fitrah 
          WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
        `, [user.userId, last30Days, today]);

        incomeCategories = incomeResult.rows
          .filter(row => parseFloat(row.total || 0) > 0)
          .map(row => ({
            kategori: row.kategori,
            total: parseFloat(row.total || 0)
          }));

        // Simplified expense categories
        const expenseResult = await client.query(`
          SELECT COALESCE(kategori, 'Lainnya') as kategori, COALESCE(SUM(jumlah), 0) as total
          FROM pengeluaran 
          WHERE user_id = $1 AND tanggal BETWEEN $2 AND $3
          GROUP BY kategori
          HAVING SUM(jumlah) > 0
          ORDER BY total DESC
          LIMIT 5
        `, [user.userId, last30Days, today]);

        expenseCategories = expenseResult.rows.map(row => ({
          kategori: row.kategori,
          total: parseFloat(row.total || 0)
        }));

      } catch (categoryError) {
        console.warn('Error fetching categories:', categoryError);
        // Continue with empty categories
      }

      // Calculate summary
      const totalIncome = monthlyStats.reduce((sum, stat) => sum + stat.pemasukan, 0);
      const totalExpense = monthlyStats.reduce((sum, stat) => sum + stat.pengeluaran, 0);

      return NextResponse.json({
        monthlyStats,
        incomeCategories,
        expenseCategories,
        summary: {
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense
        }
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Dashboard charts error:', error);
    
    // Return empty data structure
    const endDate = new Date();
    const startDate = subMonths(endDate, 2);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    const emptyMonthlyStats = months.map(month => ({
      bulan: format(month, 'MMM yyyy', { locale: localeId }),
      pemasukan: 0,
      pengeluaran: 0
    }));

    return NextResponse.json({
      monthlyStats: emptyMonthlyStats,
      incomeCategories: [],
      expenseCategories: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0
      }
    });
  }
}