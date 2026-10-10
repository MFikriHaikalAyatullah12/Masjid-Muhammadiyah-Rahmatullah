import type { PoolClient } from 'pg';
import { KATEGORI_SUMBANGAN, type DetailSumbangan, type KategoriSumbangan } from '@/lib/sumbangan';

export class ApprovalError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

interface InfaqOnlineRow {
  id: number;
  nama: string;
  no_telepon: string | null;
  kategori: KategoriSumbangan;
  tanggal: string;
  nominal: string | number;
  catatan: string | null;
  detail: DetailSumbangan;
}

interface Admin { userId: number; nama?: string }

async function insertKas(client: PoolClient, admin: Admin, row: InfaqOnlineRow, kategori: string, deskripsi: string, nominal: number) {
  const saldoResult = await client.query(
    'SELECT saldo_sesudah FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 1',
    [admin.userId]
  );
  const saldoSebelum = saldoResult.rows.length > 0 ? parseFloat(saldoResult.rows[0].saldo_sesudah) || 0 : 0;
  const kas = await client.query(
    `INSERT INTO kas_harian (
       tanggal, jenis_transaksi, kategori, deskripsi, jumlah,
       saldo_sebelum, saldo_sesudah, petugas, bukti_transaksi, user_id, created_at, updated_at
     ) VALUES ($1, 'masuk', $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id`,
    [row.tanggal, kategori, deskripsi, nominal, saldoSebelum, saldoSebelum + nominal,
     admin.nama || 'Admin', `infaq_online:${row.id}`, admin.userId]
  );
  return kas.rows[0].id as number;
}

function tahunHijriah(tanggal: string) {
  // Perkiraan tahun hijriah dari tahun masehi; cukup untuk label laporan
  const y = new Date(tanggal).getFullYear();
  return String(Math.round((y - 622) * 33 / 32));
}

async function cariByNamaTelp(client: PoolClient, table: string, kolomNama: string, row: InfaqOnlineRow, admin: Admin, extraWhere = '') {
  const telp = (row.no_telepon || '').replace(/\D/g, '');
  if (telp) {
    const byTelp = await client.query(
      `SELECT * FROM ${table} WHERE user_id = $1 AND regexp_replace(COALESCE(no_telepon,''), '\\D', '', 'g') = $2 ${extraWhere} ORDER BY id DESC LIMIT 1`,
      [admin.userId, telp]
    );
    if (byTelp.rows.length) return byTelp.rows[0];
  }
  const byNama = await client.query(
    `SELECT * FROM ${table} WHERE user_id = $1 AND lower(trim(${kolomNama})) = lower(trim($2)) ${extraWhere} ORDER BY id DESC LIMIT 1`,
    [admin.userId, row.nama]
  );
  return byNama.rows[0] || null;
}

/** Tulis sumbangan yang disetujui ke modul admin yang sesuai + kas. Dipanggil di dalam transaksi. */
export async function applyApproval(client: PoolClient, admin: Admin, row: InfaqOnlineRow) {
  const nominal = parseFloat(String(row.nominal));
  const d = row.detail || {};
  const meta = KATEGORI_SUMBANGAN[row.kategori] || KATEGORI_SUMBANGAN.infaq;
  const kasKategori = meta.kasKategori;

  switch (row.kategori) {
    case 'zakat_fitrah': {
      const jiwa = Math.max(1, Number(d.jumlah_jiwa) || 1);
      const res = await client.query(
        `INSERT INTO zakat_fitrah (
           nama_muzakki, no_telepon, jumlah_jiwa, jenis_bayar, jumlah_bayar, harga_per_kg, total_rupiah,
           tanggal_bayar, tahun_hijriah, keterangan, status, user_id, created_at
         ) VALUES ($1, $2, $3, 'uang', $4, 0, $5, $6, $7, $8, 'aktif', $9, NOW()) RETURNING id`,
        [row.nama, row.no_telepon || '', jiwa, nominal / jiwa, nominal, row.tanggal, tahunHijriah(row.tanggal),
         `Konfirmasi online #${row.id}${row.catatan ? ` · ${row.catatan}` : ''}`, admin.userId]
      );
      const kasId = await insertKas(client, admin, row, kasKategori, `Zakat Fitrah (online) dari ${row.nama}`, nominal);
      return { ref_table: 'zakat_fitrah', ref_id: res.rows[0].id as number, kasId };
    }

    case 'zakat_mal': {
      const res = await client.query(
        `INSERT INTO zakat_mal (
           nama_muzakki, no_telepon, jenis_harta, nilai_harta, nisab, haul_terpenuhi, persentase_zakat, jumlah_zakat,
           tanggal_bayar, tahun_hijriah, keterangan, status, user_id, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, 0, true, 2.5, $5, $6, $7, $8, 'diterima', $9, NOW(), NOW()) RETURNING id`,
        [row.nama, row.no_telepon || '', d.jenis_harta || 'uang', Number(d.nilai_harta) || nominal * 40, nominal,
         row.tanggal, tahunHijriah(row.tanggal), `Konfirmasi online #${row.id}${row.catatan ? ` · ${row.catatan}` : ''}`, admin.userId]
      );
      const kasId = await insertKas(client, admin, row, kasKategori, `Zakat Mal (online) dari ${row.nama}`, nominal);
      return { ref_table: 'zakat_mal', ref_id: res.rows[0].id as number, kasId };
    }

    case 'donatur_bulanan': {
      const tgl = new Date(row.tanggal);
      const bulan = Number(d.bulan) || tgl.getMonth() + 1;
      const tahun = Number(d.tahun) || tgl.getFullYear();
      let donatur = await cariByNamaTelp(client, 'donatur_bulanan', 'nama', row, admin);
      if (!donatur) {
        const created = await client.query(
          `INSERT INTO donatur_bulanan (nama, no_telepon, jumlah_donasi, tanggal_mulai, metode_pembayaran, tanggal_pembayaran, keterangan, user_id)
           VALUES ($1, $2, $3, $4, 'transfer', $5, $6, $7) RETURNING *`,
          [row.nama, row.no_telepon || null, nominal, row.tanggal, tgl.getDate(), `Terdaftar otomatis dari konfirmasi online #${row.id}`, admin.userId]
        );
        donatur = created.rows[0];
      }
      const dup = await client.query(
        'SELECT id FROM pembayaran_donatur WHERE donatur_id = $1 AND bulan = $2 AND tahun = $3',
        [donatur.id, bulan, tahun]
      );
      if (dup.rows.length) {
        throw new ApprovalError(`Pembayaran ${row.nama} untuk bulan ${bulan}/${tahun} sudah tercatat. Tolak kiriman ini atau catat manual.`, 409);
      }
      const pay = await client.query(
        `INSERT INTO pembayaran_donatur (donatur_id, tanggal_bayar, bulan, tahun, jumlah, metode_pembayaran, bukti_pembayaran, status, keterangan)
         VALUES ($1, $2, $3, $4, $5, 'transfer', $6, 'lunas', $7) RETURNING id`,
        [donatur.id, row.tanggal, bulan, tahun, nominal, `infaq_online:${row.id}`, row.catatan || null]
      );
      const kasId = await insertKas(client, admin, row, kasKategori, `Donasi bulanan (online) - ${donatur.nama}`, nominal);
      return { ref_table: 'pembayaran_donatur', ref_id: pay.rows[0].id as number, kasId };
    }

    case 'tabungan_qurban': {
      let tabungan = await cariByNamaTelp(client, 'tabungan_qurban', 'nama_penabung', row, admin, "AND status = 'menabung'");
      if (!tabungan) {
        const target = Number(d.target_tabungan) || 0;
        if (target <= 0) {
          throw new ApprovalError(
            `Belum ada tabungan aktif atas nama ${row.nama} dan target tabungan tidak diisi. Buat tabungan di menu Tabungan Qurban, lalu terima lagi.`, 422
          );
        }
        const created = await client.query(
          `INSERT INTO tabungan_qurban (nama_penabung, no_telepon, jenis_hewan, target_tabungan, total_terkumpul, sisa_kekurangan,
             tanggal_mulai, target_qurban_tahun, status, keterangan, user_id)
           VALUES ($1, $2, $3, $4, 0, $4, $5, $6, 'menabung', $7, $8) RETURNING *`,
          [row.nama, row.no_telepon || null, d.jenis_hewan || 'kambing', target, row.tanggal,
           new Date(row.tanggal).getFullYear() + 1, `Dibuat otomatis dari konfirmasi online #${row.id}`, admin.userId]
        );
        tabungan = created.rows[0];
      }
      const cicilan = await client.query(
        `INSERT INTO cicilan_qurban (tabungan_id, tanggal_bayar, jumlah, metode_pembayaran, bukti_pembayaran, petugas, keterangan)
         VALUES ($1, $2, $3, 'transfer', $4, $5, $6) RETURNING id`,
        [tabungan.id, row.tanggal, nominal, `infaq_online:${row.id}`, admin.nama || 'Admin', row.catatan || null]
      );
      const total = parseFloat(tabungan.total_terkumpul) + nominal;
      const sisa = parseFloat(tabungan.target_tabungan) - total;
      await client.query(
        `UPDATE tabungan_qurban SET total_terkumpul = $1, sisa_kekurangan = $2, status = $3, updated_at = NOW() WHERE id = $4`,
        [total, Math.max(0, sisa), sisa <= 0 ? 'terpenuhi' : 'menabung', tabungan.id]
      );
      const kasId = await insertKas(client, admin, row, kasKategori, `Cicilan tabungan qurban (online) - ${tabungan.nama_penabung}`, nominal);
      return { ref_table: 'cicilan_qurban', ref_id: cicilan.rows[0].id as number, kasId };
    }

    default: {
      const jenis = d.jenis === 'sedekah' ? 'sedekah' : 'infaq';
      const kasId = await insertKas(client, admin, row, jenis, `${jenis === 'sedekah' ? 'Sedekah' : 'Infaq'} (online) dari ${row.nama}`, nominal);
      const res = await client.query(
        `INSERT INTO infaq (nama, no_telepon, jenis, tanggal, jumlah, metode_pembayaran, keterangan, sumber, infaq_online_id, kas_harian_id, user_id)
         VALUES ($1, $2, $3, $4, $5, 'transfer', $6, 'online', $7, $8, $9) RETURNING id`,
        [row.nama, row.no_telepon || null, jenis, row.tanggal, nominal, row.catatan || null, row.id, kasId, admin.userId]
      );
      return { ref_table: 'infaq', ref_id: res.rows[0].id as number, kasId };
    }
  }
}
