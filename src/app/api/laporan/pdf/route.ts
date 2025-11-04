import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import pool from '@/lib/db';

// Ensure proper character encoding
const cleanText = (text: string): string => {
  return text.replace(/[^\x00-\x7F]/g, "").trim();
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari') || '2024-01-01';
    const sampai = searchParams.get('sampai') || new Date().toISOString().split('T')[0];

    const client = await pool.connect();

    try {
      // Get laporan data
      const [
        zakatFitrahResult,
        zakatMalResult,
        kasResult,
        pengeluaranResult,
        currentSaldoResult
      ] = await Promise.all([
        client.query(`
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(total_rupiah), 0) as total_uang
          FROM zakat_fitrah 
          WHERE tanggal_bayar BETWEEN $1 AND $2
        `, [dari, sampai]),
        client.query(`
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(jumlah_zakat), 0) as total
          FROM zakat_mal 
          WHERE tanggal_bayar BETWEEN $1 AND $2
        `, [dari, sampai]),
        client.query(`
          SELECT 
            COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk' THEN jumlah ELSE 0 END), 0) as pemasukan,
            COALESCE(SUM(CASE WHEN jenis_transaksi = 'keluar' THEN jumlah ELSE 0 END), 0) as pengeluaran
          FROM kas_harian 
          WHERE tanggal BETWEEN $1 AND $2
        `, [dari, sampai]),
        client.query(`
          SELECT 
            COALESCE(SUM(jumlah), 0) as total_pengeluaran
          FROM pengeluaran 
          WHERE tanggal BETWEEN $1 AND $2
        `, [dari, sampai]),
        client.query(`
          SELECT 
            COALESCE(
              (SELECT SUM(CASE WHEN jenis_transaksi = 'masuk' THEN jumlah ELSE -jumlah END) 
               FROM kas_harian 
               WHERE tanggal <= $1), 
              0
            ) as saldo_kas_saat_ini
        `, [sampai])
      ]);

      const zakatFitrah = zakatFitrahResult.rows[0];
      const zakatMal = zakatMalResult.rows[0];
      const kas = kasResult.rows[0];
      const pengeluaran = pengeluaranResult.rows[0];
      const currentSaldo = currentSaldoResult.rows[0];

      // Create PDF dengan konfigurasi sederhana
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Helper function to format currency
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(amount);
      };

      // Helper function to format date
      const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      // Helper function untuk tabel yang bersih
      const drawTable = (x: number, y: number, data: string[][], colWidths: number[], title?: string) => {
        const rowHeight = 8;
        let currentY = y;
        
        // Draw title if provided
        if (title) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(60, 60, 60);
          doc.text(title, x, currentY);
          currentY += 12;
        }
        
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);
        
        // Pastikan tabel tidak melewati margin kanan (max 170)
        const maxTableWidth = 170 - x;
        const adjustedColWidths = colWidths.map(width => 
          Math.min(width, maxTableWidth * (width / tableWidth))
        );
        const adjustedTableWidth = adjustedColWidths.reduce((a, b) => a + b, 0);
        
        // Header dengan background sederhana
        doc.setFillColor(230, 230, 230);
        doc.rect(x, currentY, adjustedTableWidth, rowHeight, 'F');
        
        // Header border
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.5);
        doc.rect(x, currentY, adjustedTableWidth, rowHeight);
        
        // Header text
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        let currentX = x;
        for (let i = 0; i < data[0].length; i++) {
          doc.text(data[0][i], currentX + 2, currentY + 6);
          currentX += adjustedColWidths[i];
        }
        currentY += rowHeight;
        
        // Data rows
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(8);
        
        for (let i = 1; i < data.length; i++) {
          // Special styling for important rows
          const isLastTwoRows = title === undefined && i >= data.length - 2;
          const isFinalRow = title === undefined && i === data.length - 1;
          
          // Background untuk baris penting
          if (isFinalRow) {
            doc.setFillColor(220, 255, 220); // Light green for final kas
            doc.rect(x, currentY, adjustedTableWidth, rowHeight, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
          } else if (isLastTwoRows) {
            doc.setFillColor(240, 245, 255); // Light blue for saldo akhir
            doc.rect(x, currentY, adjustedTableWidth, rowHeight, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
          } else if (i % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(x, currentY, adjustedTableWidth, rowHeight, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
          }
          
          // Row border
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.rect(x, currentY, adjustedTableWidth, rowHeight);
          
          currentX = x;
          for (let j = 0; j < data[i].length; j++) {
            const text = data[i][j];
            const maxTextWidth = adjustedColWidths[j] - 4;
            
            // Pastikan text tidak kosong
            let displayText = text || '';
            const currentFontSize = isFinalRow ? 9 : 8;
            
            // Hanya truncate jika text tidak kosong
            if (displayText.length > 0) {
              const textWidth = doc.getStringUnitWidth(displayText) * currentFontSize / doc.internal.scaleFactor;
              if (textWidth > maxTextWidth) {
                const maxChars = Math.floor(maxTextWidth / (textWidth / displayText.length)) - 3;
                displayText = displayText.substring(0, maxChars) + '...';
              }
            }
            
            if (j === 1) { // Right align numbers
              const displayTextWidth = doc.getStringUnitWidth(displayText) * currentFontSize / doc.internal.scaleFactor;
              doc.text(displayText, currentX + adjustedColWidths[j] - displayTextWidth - 2, currentY + 6);
            } else { // Left align text
              doc.text(displayText, currentX + 2, currentY + 6);
            }
            currentX += adjustedColWidths[j];
          }
          currentY += rowHeight;
          
          // Reset font for next iteration
          if (isLastTwoRows) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
          }
        }
        
        // Final border
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.5);
        doc.rect(x, y + rowHeight, adjustedTableWidth, rowHeight * (data.length - 1));
        
        return currentY + 3; // Minimal spacing
      };

      // Set font dengan encoding yang benar
      doc.setFont('helvetica', 'normal');

      // Simple Professional Header
      doc.setFillColor(45, 55, 72); // Dark blue-gray header
      doc.rect(0, 0, 210, 40, 'F');
      
      // Header content - judul yang lebih sederhana
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('LAPORAN KEUANGAN', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Periode: ${formatDate(dari)} - ${formatDate(sampai)}`, 105, 32, { align: 'center' });

      // Professional border line
      doc.setDrawColor(45, 55, 72);
      doc.setLineWidth(1);
      doc.line(20, 50, 170, 50);

      let yPosition = 65;

      // Zakat Fitrah Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('ZAKAT FITRAH', 20, yPosition);
      yPosition += 5;

      const zakatFitrahData = [
        ['Keterangan', 'Jumlah'],
        ['Jumlah Muzakki', `${parseInt(zakatFitrah.count)} orang`],
        ['Total Zakat Fitrah', formatCurrency(parseFloat(zakatFitrah.total_uang) || 0)]
      ];
      
      yPosition = drawTable(20, yPosition, zakatFitrahData, [90, 70]);
      yPosition += 10;

      // Zakat Mal Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('ZAKAT MAL', 20, yPosition);
      yPosition += 5;

      const zakatMalData = [
        ['Keterangan', 'Jumlah'],
        ['Jumlah Muzakki', `${parseInt(zakatMal.count)} orang`],
        ['Total Zakat Mal', formatCurrency(parseFloat(zakatMal.total) || 0)]
      ];
      
      yPosition = drawTable(20, yPosition, zakatMalData, [90, 70]);
      yPosition += 10;

      // Kas Harian Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('KAS HARIAN', 20, yPosition);
      yPosition += 5;

      const totalPemasukan = parseFloat(kas.pemasukan) || 0;
      const totalPengeluaranKas = parseFloat(kas.pengeluaran) || 0;
      const saldoKas = totalPemasukan - totalPengeluaranKas;

      const kasData = [
        ['Keterangan', 'Jumlah'],
        ['Total Pemasukan', formatCurrency(totalPemasukan)],
        ['Total Pengeluaran', formatCurrency(totalPengeluaranKas)],
        ['Saldo Kas', formatCurrency(saldoKas)]
      ];
      
      yPosition = drawTable(20, yPosition, kasData, [90, 70]);
      yPosition += 10;

      // Pengeluaran Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('PENGELUARAN', 20, yPosition);
      yPosition += 5;

      const pengeluaranData = [
        ['Keterangan', 'Jumlah'],
        ['Total Pengeluaran', formatCurrency(parseFloat(pengeluaran.total_pengeluaran) || 0)]
      ];
      
      yPosition = drawTable(20, yPosition, pengeluaranData, [90, 70]);
      yPosition += 15;

      // Footer yang bersih tanpa kotak
      const pageHeight = doc.internal.pageSize.height;
      
      // Pastikan tidak ada overlap dengan konten
      const minFooterY = Math.max(yPosition + 10, pageHeight - 30);
      
      // Footer content langsung tanpa border berlebihan
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      // Baris pertama
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 20, minFooterY);
      
      doc.text('Sistem Manajemen Zakat', 170, minFooterY, { align: 'right' });
      
      // Baris kedua
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text('Laporan ini digenerate secara otomatis oleh sistem', 105, minFooterY + 6, { align: 'center' });
      
      // Nomor halaman
      doc.text('Halaman 1 dari 1', 170, minFooterY + 12, { align: 'right' });

      // Generate PDF buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      // Return PDF response
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="laporan-keuangan-${dari}-${sampai}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Gagal menghasilkan PDF laporan' },
      { status: 500 }
    );
  }
}