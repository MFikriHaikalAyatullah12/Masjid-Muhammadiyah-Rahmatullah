import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';
import { getUserFromToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();

    try {
      // Get overall statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total_tabungan,
          COALESCE(SUM(total_terkumpul), 0) as total_terkumpul,
          COALESCE(SUM(target_tabungan), 0) as target_total,
          COUNT(CASE WHEN status = 'menabung' THEN 1 END) as tabungan_aktif
        FROM tabungan_qurban
      `;
      const statsResult = await client.query(statsQuery);
      const stats = statsResult.rows[0];

      // Get status distribution
      const statusQuery = `
        SELECT 
          status,
          COUNT(*) as count
        FROM tabungan_qurban
        GROUP BY status
        ORDER BY count DESC
      `;
      const statusResult = await client.query(statusQuery);
      
      const totalTabungan = parseInt(stats.total_tabungan) || 0;
      const statusDistribution = statusResult.rows.map(row => {
        const count = parseInt(row.count);
        const percentage = totalTabungan > 0 ? Math.round((count / totalTabungan) * 100) : 0;
        
        return {
          status: row.status || 'tidak_diketahui',
          count: count,
          percentage: percentage
        };
      });

      // Add default if no data
      if (statusDistribution.length === 0) {
        statusDistribution.push({
          status: 'tidak_ada_data',
          count: 0,
          percentage: 100
        });
      }

      // Get progress data for top performers
      const progressQuery = `
        SELECT 
          nama_penabung as nama,
          total_terkumpul as terkumpul,
          target_tabungan as target,
          CASE 
            WHEN target_tabungan > 0 THEN (total_terkumpul * 100.0 / target_tabungan)
            ELSE 0
          END as persentase
        FROM tabungan_qurban 
        ORDER BY persentase DESC, total_terkumpul DESC
        LIMIT 10
      `;
      const progressResult = await client.query(progressQuery);
      
      const progressData = progressResult.rows.map(row => ({
        nama: row.nama || 'Tidak diketahui',
        persentase: Math.min(parseFloat(row.persentase) || 0, 100),
        terkumpul: parseFloat(row.terkumpul) || 0,
        target: parseFloat(row.target) || 0
      }));

      const response = {
        totalTabungan: Math.max(parseInt(stats.total_tabungan) || 0, 0),
        totalTerkumpul: Math.max(parseFloat(stats.total_terkumpul) || 0, 0),
        targetTotal: Math.max(parseFloat(stats.target_total) || 0, 0),
        tabunganAktif: Math.max(parseInt(stats.tabungan_aktif) || 0, 0),
        statusDistribution: statusDistribution.length > 0 ? statusDistribution : [{
          status: 'tidak_ada_data',
          count: 0,
          percentage: 100
        }],
        progressData: progressData.length > 0 ? progressData : []
      };

      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching tabungan stats:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil statistik tabungan' },
      { status: 500 }
    );
  }
}