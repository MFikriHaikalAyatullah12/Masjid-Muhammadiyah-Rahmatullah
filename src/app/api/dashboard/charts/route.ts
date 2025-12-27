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

      // Get categories data for a wider range to ensure we capture data
      let incomeCategories: any[] = [];
      let expenseCategories: any[] = [];
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const last30Days = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
      const last90Days = format(subMonths(new Date(), 3), 'yyyy-MM-dd'); // Wider range for categories

      try {
        // Try with wider date range first, then fallback to all-time data
        let incomeResult = await client.query(`
          SELECT 'Zakat Mal' as kategori, COALESCE(SUM(jumlah_zakat), 0) as total
          FROM zakat_mal 
          WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
          
          UNION ALL
          
          SELECT 'Zakat Fitrah' as kategori, COALESCE(SUM(total_rupiah), 0) as total
          FROM zakat_fitrah 
          WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
        `, [user.userId, last90Days, today]);
        
        // If no data found in last 90 days, get all-time data
        if (incomeResult.rows.every(row => parseFloat(row.total || 0) === 0)) {
          incomeResult = await client.query(`
            SELECT 'Zakat Mal' as kategori, COALESCE(SUM(jumlah_zakat), 0) as total
            FROM zakat_mal 
            WHERE user_id = $1
            
            UNION ALL
            
            SELECT 'Zakat Fitrah' as kategori, COALESCE(SUM(total_rupiah), 0) as total
            FROM zakat_fitrah 
            WHERE user_id = $1
          `, [user.userId]);
        }

        incomeCategories = incomeResult.rows
          .filter(row => {
            const total = parseFloat(row.total || 0);
            return total > 0;
          })
          .map(row => ({
            kategori: row.kategori,
            total: parseFloat(row.total || 0)
          }));

        // Simplified expense categories with wider range
        let expenseResult = await client.query(`
          SELECT COALESCE(kategori, 'Lainnya') as kategori, COALESCE(SUM(jumlah), 0) as total
          FROM pengeluaran 
          WHERE user_id = $1 AND tanggal BETWEEN $2 AND $3
          GROUP BY kategori
          HAVING SUM(jumlah) > 0
          ORDER BY total DESC
          LIMIT 5
        `, [user.userId, last90Days, today]);
        
        // If no expense data in last 90 days, get all-time data
        if (expenseResult.rows.length === 0) {
          expenseResult = await client.query(`
            SELECT COALESCE(kategori, 'Lainnya') as kategori, COALESCE(SUM(jumlah), 0) as total
            FROM pengeluaran 
            WHERE user_id = $1
            GROUP BY kategori
            HAVING SUM(jumlah) > 0
            ORDER BY total DESC
            LIMIT 5
          `, [user.userId]);
        }

        expenseCategories = expenseResult.rows.map(row => ({
          kategori: row.kategori,
          total: parseFloat(row.total || 0)
        }));

      } catch (categoryError) {
        console.error('Error fetching categories:', categoryError);
        // Continue with empty categories
      }

      // Calculate summary
      const totalIncome = monthlyStats.reduce((sum, stat) => sum + stat.pemasukan, 0);
      const totalExpense = monthlyStats.reduce((sum, stat) => sum + stat.pengeluaran, 0);

      // Calculate percentages for income categories with better rounding logic
      const totalIncomeFromCategories = incomeCategories.reduce((sum, cat) => sum + cat.total, 0);
      
      const incomeStats = incomeCategories.map(cat => {
        if (totalIncomeFromCategories === 0) return {
          kategori: cat.kategori,
          total: cat.total,
          persentase: 0
        };
        
        const exactPercentage = (cat.total / totalIncomeFromCategories) * 100;
        
        // For very small percentages (< 1%), show minimum 1%
        // For larger percentages, round normally
        let displayPercentage;
        if (exactPercentage < 1 && exactPercentage > 0) {
          displayPercentage = 1; // Minimum 1% for any non-zero contribution
        } else {
          displayPercentage = Math.round(exactPercentage);
        }
        
        return {
          kategori: cat.kategori,
          total: cat.total,
          persentase: displayPercentage
        };
      });
      
      // Adjust percentages to ensure they add up to 100% when there are multiple categories
      if (incomeStats.length > 1) {
        const totalPercentage = incomeStats.reduce((sum, stat) => sum + stat.persentase, 0);
        if (totalPercentage > 100) {
          // Reduce the largest percentage to make total = 100%
          const largestIndex = incomeStats.findIndex(stat => 
            stat.persentase === Math.max(...incomeStats.map(s => s.persentase))
          );
          incomeStats[largestIndex].persentase = 100 - incomeStats.filter((_, i) => i !== largestIndex).reduce((sum, stat) => sum + stat.persentase, 0);
        }
      }

      // Calculate percentages for expense categories with better rounding logic
      const totalExpenseFromCategories = expenseCategories.reduce((sum, cat) => sum + cat.total, 0);
      
      const categoryStats = expenseCategories.map(cat => {
        if (totalExpenseFromCategories === 0) return {
          kategori: cat.kategori,
          total: cat.total,
          persentase: 0
        };
        
        const exactPercentage = (cat.total / totalExpenseFromCategories) * 100;
        
        // For very small percentages (< 1%), show minimum 1%
        // For larger percentages, round normally
        let displayPercentage;
        if (exactPercentage < 1 && exactPercentage > 0) {
          displayPercentage = 1; // Minimum 1% for any non-zero contribution
        } else {
          displayPercentage = Math.round(exactPercentage);
        }
        
        return {
          kategori: cat.kategori,
          total: cat.total,
          persentase: displayPercentage
        };
      });
      
      // Adjust percentages to ensure they add up to 100% when there are multiple categories
      if (categoryStats.length > 1) {
        const totalPercentage = categoryStats.reduce((sum, stat) => sum + stat.persentase, 0);
        if (totalPercentage > 100) {
          // Reduce the largest percentage to make total = 100%
          const largestIndex = categoryStats.findIndex(stat => 
            stat.persentase === Math.max(...categoryStats.map(s => s.persentase))
          );
          categoryStats[largestIndex].persentase = 100 - categoryStats.filter((_, i) => i !== largestIndex).reduce((sum, stat) => sum + stat.persentase, 0);
        }
      }

      return NextResponse.json({
        monthlyStats,
        incomeStats,
        categoryStats,
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
      incomeStats: [],
      categoryStats: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0
      }
    });
  }
}