import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari') || '2024-01-01';
    const sampai = searchParams.get('sampai') || new Date().toISOString().split('T')[0];

    const client = await pool.connect();

    try {
      // Get detailed financial data
      const queries = await Promise.all([
        // Saldo sebelumnya
        client.query(`
          SELECT COALESCE(saldo_sesudah, 0) as saldo
          FROM kas_harian
          WHERE user_id = $1 AND tanggal < $2
          ORDER BY tanggal DESC, created_at DESC
          LIMIT 1
        `, [user.userId, dari]),
        
        // Kas masuk berdasarkan kategori
        client.query(`
          SELECT kategori, SUM(jumlah) as total
          FROM kas_harian 
          WHERE user_id = $1 AND tanggal BETWEEN $2 AND $3 AND jenis_transaksi = 'masuk'
          GROUP BY kategori
          ORDER BY total DESC
        `, [user.userId, dari, sampai]),
        
        // Zakat Fitrah
        client.query(`
          SELECT SUM(total_rupiah) as total
          FROM zakat_fitrah 
          WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
        `, [user.userId, dari, sampai]),
        
        // Zakat Mal
        client.query(`
          SELECT SUM(jumlah_zakat) as total
          FROM zakat_mal 
          WHERE user_id = $1 AND tanggal_bayar BETWEEN $2 AND $3
        `, [user.userId, dari, sampai]),
        
        // Pengeluaran berdasarkan kategori
        client.query(`
          SELECT kategori, SUM(jumlah) as total
          FROM pengeluaran 
          WHERE user_id = $1 AND tanggal BETWEEN $2 AND $3
          GROUP BY kategori
          ORDER BY total DESC
        `, [user.userId, dari, sampai]),
        
        // Kas keluar berdasarkan kategori
        client.query(`
          SELECT kategori, SUM(jumlah) as total
          FROM kas_harian 
          WHERE user_id = $1 AND tanggal BETWEEN $2 AND $3 AND jenis_transaksi = 'keluar'
          GROUP BY kategori
          ORDER BY total DESC
        `, [user.userId, dari, sampai]),
        
        // Saldo akhir
        client.query(`
          SELECT COALESCE(saldo_sesudah, 0) as saldo
          FROM kas_harian
          WHERE user_id = $1 AND tanggal <= $2
          ORDER BY tanggal DESC, created_at DESC
          LIMIT 1
        `, [user.userId, sampai])
      ]);

      const [saldoSebelumResult, kasMasukResult, zakatFitrahResult, zakatMalResult, 
             pengeluaranResult, kasKeluarResult, saldoAkhirResult] = queries;

      const saldoSebelum = saldoSebelumResult.rows[0]?.saldo || 0;
      const kasMasuk = kasMasukResult.rows;
      const zakatFitrah = zakatFitrahResult.rows[0]?.total || 0;
      const zakatMal = zakatMalResult.rows[0]?.total || 0;
      const pengeluaranKategori = pengeluaranResult.rows;
      const kasKeluarKategori = kasKeluarResult.rows;
      const saldoAkhir = saldoAkhirResult.rows[0]?.saldo || 0;

      // Create PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Helper functions
      const formatRupiah = (amount: number) => {
        if (amount === 0) return '0';
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      };

      const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      // Header sederhana
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('LAPORAN KEUANGAN MASJID', 105, 25, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Periode: ${formatDate(dari)} s/d ${formatDate(sampai)}`, 105, 35, { align: 'center' });
      
      // Garis bawah header
      doc.setDrawColor(0, 0, 0);
      doc.line(20, 42, 190, 42);

      let y = 55;

      // PEMASUKAN Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PEMASUKAN', 20, y);
      y += 12;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      let counter = 1;
      let totalPemasukan = 0;
      
      // Kas masuk per kategori (data real dari web)
      kasMasuk.forEach(item => {
        const kategori = item.kategori.toUpperCase().replace(/_/g, ' ');
        const total = parseFloat(item.total);
        doc.text(`${counter}. ${kategori}`, 25, y);
        doc.text(': ', 125, y);
        doc.text(formatRupiah(total), 170, y, { align: 'right' });
        totalPemasukan += total;
        y += 8;
        counter++;
      });

      // Zakat Fitrah (data real dari web)
      if (zakatFitrah > 0) {
        doc.text(`${counter}. ZAKAT FITRAH`, 25, y);
        doc.text(': ', 125, y);
        doc.text(formatRupiah(zakatFitrah), 170, y, { align: 'right' });
        totalPemasukan += parseFloat(zakatFitrah.toString());
        y += 8;
        counter++;
      }

      // Zakat Mal (data real dari web)
      if (zakatMal > 0) {
        doc.text(`${counter}. ZAKAT MAL`, 25, y);
        doc.text(': ', 125, y);
        doc.text(formatRupiah(zakatMal), 170, y, { align: 'right' });
        totalPemasukan += parseFloat(zakatMal.toString());
        y += 8;
        counter++;
      }

      // Jika tidak ada data pemasukan
      if (totalPemasukan === 0) {
        doc.setFont('helvetica', 'italic');
        doc.text('Tidak ada pemasukan pada periode ini', 25, y);
        y += 8;
      }

      // Total Pemasukan
      y += 3;
      doc.setDrawColor(0, 0, 0);
      doc.line(125, y, 170, y);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', 25, y);
      doc.text(': ', 125, y);
      doc.text(formatRupiah(totalPemasukan), 170, y, { align: 'right' });
      y += 20;

      // PENGELUARAN Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PENGELUARAN', 20, y);
      y += 12;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      counter = 1;
      let totalPengeluaran = 0;

      // Pengeluaran per kategori (data real dari web)
      pengeluaranKategori.forEach(item => {
        const kategori = item.kategori.toUpperCase().replace(/_/g, ' ');
        const total = parseFloat(item.total);
        doc.text(`${counter}. ${kategori}`, 25, y);
        doc.text(': ', 125, y);
        doc.text(formatRupiah(total), 170, y, { align: 'right' });
        totalPengeluaran += total;
        y += 8;
        counter++;
      });

      // Kas keluar per kategori (data real dari web)
      kasKeluarKategori.forEach(item => {
        const kategori = item.kategori.toUpperCase().replace(/_/g, ' ');
        const total = parseFloat(item.total);
        doc.text(`${counter}. ${kategori}`, 25, y);
        doc.text(': ', 125, y);
        doc.text(formatRupiah(total), 170, y, { align: 'right' });
        totalPengeluaran += total;
        y += 8;
        counter++;
      });

      // Jika tidak ada data pengeluaran
      if (totalPengeluaran === 0) {
        doc.setFont('helvetica', 'italic');
        doc.text('Tidak ada pengeluaran pada periode ini', 25, y);
        y += 8;
      }

      // Total Pengeluaran
      y += 3;
      doc.line(125, y, 170, y);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', 25, y);
      doc.text(': ', 125, y);
      doc.text(formatRupiah(totalPengeluaran), 170, y, { align: 'right' });
      y += 20;

      // Ringkasan Akhir
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RINGKASAN', 20, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('TOTAL PEMASUKAN', 25, y);
      doc.text(': ', 125, y);
      doc.text(formatRupiah(totalPemasukan), 170, y, { align: 'right' });
      y += 8;

      doc.text('TOTAL PENGELUARAN', 25, y);
      doc.text(': ', 125, y);
      doc.text(formatRupiah(totalPengeluaran), 170, y, { align: 'right' });
      y += 8;

      // Garis untuk saldo akhir
      doc.setDrawColor(0, 0, 0);
      doc.line(125, y + 2, 170, y + 2);
      y += 10;

      const saldoAkhirCalculated = totalPemasukan - totalPengeluaran;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('SALDO AKHIR', 25, y);
      doc.text(': ', 125, y);
      doc.text(formatRupiah(saldoAkhirCalculated), 170, y, { align: 'right' });

      // Area tanda tangan
      y += 35;
      if (y > 210) {
        doc.addPage();
        y = 30;
      }

      // Bagian tanda tangan
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Yang bertanda tangan
      doc.text('Yang Bertanda Tangan,', 25, y);
      
      // Ruang untuk tanda tangan
      y += 35;
      
      // Garis titik-titik untuk tanda tangan - di tengah
      doc.setFontSize(10);
      doc.text('(........................................................)', 105, y, { align: 'center' });
      
      // Pengurus Masjid - di bawah garis titik-titik
      y += 8;
      doc.text('Pengurus Masjid', 105, y, { align: 'center' });
      
      // Footer informasi sistem - posisi di bagian paling bawah
      y += 20;
      doc.setDrawColor(0, 0, 0);
      doc.line(20, y, 190, y);
      y += 8;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })} pukul ${new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })}`, 20, y);
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.text('Laporan ini dibuat otomatis oleh sistem', 105, y + 6, { align: 'center' });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="laporan-zakat-${dari}-${sampai}.pdf"`,
        },
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}