import pool from './db';
import bcryptjs from 'bcryptjs';
import type { User, UserFromDB, ZakatFitrah, ZakatMal, KasHarian, Pengeluaran, Mustahiq, DistribusiZakat } from './schemas';

// Export pool for direct access
export { default as pool } from './db';

// Helper function untuk mendapatkan saldo kas terkini
export async function getCurrentSaldo(): Promise<number> {
  const result = await pool.query(
    'SELECT saldo_sesudah FROM kas_harian ORDER BY tanggal DESC, created_at DESC LIMIT 1'
  );
  return result.rows.length > 0 ? parseFloat(result.rows[0].saldo_sesudah) : 0;
}

// User functions
export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const hashedPassword = await bcryptjs.hash(userData.password, 10);
  const result = await pool.query(
    'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [userData.username, userData.email, hashedPassword, userData.role]
  );
  return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<UserFromDB | null> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}

// Mustahiq functions
export async function getAllMustahiq(): Promise<Mustahiq[]> {
  const result = await pool.query('SELECT * FROM mustahiq ORDER BY nama ASC');
  return result.rows;
}

export async function createMustahiq(data: Omit<Mustahiq, 'id'>): Promise<Mustahiq> {
  const result = await pool.query(
    'INSERT INTO mustahiq (nama, alamat, no_telepon, kategori, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
    [data.nama, data.alamat, data.no_telepon, data.kategori, data.status || 'aktif']
  );
  return result.rows[0];
}

// Zakat Fitrah functions
export async function getAllZakatFitrah(): Promise<ZakatFitrah[]> {
  const result = await pool.query('SELECT * FROM zakat_fitrah ORDER BY tanggal_bayar DESC');
  
  // Map database columns to interface correctly
  return result.rows.map(row => ({
    id: row.id,
    nama_muzakki: row.nama_muzakki || 'N/A',
    alamat_muzakki: row.alamat_muzakki || '',
    no_telepon: row.no_telepon || '',
    jumlah_jiwa: row.jumlah_jiwa || 0,
    jenis_bayar: row.jenis_bayar || 'beras',
    jumlah_bayar: row.jumlah_bayar || 0,
    harga_per_kg: row.harga_per_kg || 0,
    total_rupiah: row.total_rupiah || 0,
    tanggal_bayar: row.tanggal_bayar ? new Date(row.tanggal_bayar).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    tahun_hijriah: row.tahun_hijriah?.toString() || new Date().getFullYear().toString(),
    status: row.status || 'diterima',
    keterangan: row.keterangan || ''
  }));
}

export async function createZakatFitrah(data: Omit<ZakatFitrah, 'id'>): Promise<ZakatFitrah> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert zakat fitrah - mapping dari interface ke database
    const zakatResult = await client.query(
      'INSERT INTO zakat_fitrah (nama_muzakki, jumlah_jiwa, jenis_bayar, jumlah_bayar, harga_per_kg, total_rupiah, tanggal_bayar, tahun_hijriah, keterangan, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *',
      [data.nama_muzakki, data.jumlah_jiwa, data.jenis_bayar, data.jumlah_bayar, data.harga_per_kg || 0, data.total_rupiah, data.tanggal_bayar, data.tahun_hijriah, data.keterangan]
    );
    
    // Update kas harian
    const currentSaldo = await getCurrentSaldo();
    const newSaldo = currentSaldo + data.total_rupiah;
    
    await client.query(
      'INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [data.tanggal_bayar, 'masuk', 'zakat_fitrah', `Zakat Fitrah dari ${data.nama_muzakki}`, data.total_rupiah, currentSaldo, newSaldo, 'Admin']
    );
    
    await client.query('COMMIT');
    return zakatResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Zakat Mal functions
export async function getAllZakatMal(): Promise<ZakatMal[]> {
  const result = await pool.query('SELECT * FROM zakat_mal ORDER BY tanggal_bayar DESC');
  
  // Map database columns to interface correctly
  return result.rows.map(row => ({
    id: row.id,
    nama_muzakki: row.nama_muzakki || 'N/A',
    alamat_muzakki: row.alamat_muzakki || '',
    no_telepon: row.no_telepon || '',
    jenis_harta: row.jenis_harta || 'emas',
    nilai_harta: row.nilai_harta || 0,
    nisab: row.nisab || 0,
    haul_terpenuhi: row.haul_terpenuhi || true,
    persentase_zakat: row.persentase_zakat || 2.5,
    jumlah_zakat: row.jumlah_zakat || 0,
    tanggal_bayar: row.tanggal_bayar ? new Date(row.tanggal_bayar).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    tahun_hijriah: row.tahun_hijriah || new Date().getFullYear().toString(),
    status: row.status || 'diterima',
    keterangan: row.keterangan || ''
  }));
}

export async function createZakatMal(data: Omit<ZakatMal, 'id'>): Promise<ZakatMal> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert zakat mal - mapping dari interface ke database
    const zakatResult = await client.query(
      'INSERT INTO zakat_mal (nama_muzakki, jenis_harta, nilai_harta, nisab, jumlah_zakat, tanggal_bayar, tahun_hijriah, keterangan, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *',
      [data.nama_muzakki, data.jenis_harta, data.nilai_harta, data.nisab, data.jumlah_zakat, data.tanggal_bayar, data.tahun_hijriah || new Date().getFullYear().toString(), data.keterangan]
    );
    
    // Update kas harian
    const currentSaldo = await getCurrentSaldo();
    const newSaldo = currentSaldo + data.jumlah_zakat;
    
    await client.query(
      'INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [data.tanggal_bayar, 'masuk', 'zakat_mal', `Zakat Mal dari ${data.nama_muzakki}`, data.jumlah_zakat, currentSaldo, newSaldo, 'Admin']
    );
    
    await client.query('COMMIT');
    return zakatResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Kas Harian functions
export async function getAllKasHarian(): Promise<KasHarian[]> {
  const result = await pool.query('SELECT * FROM kas_harian ORDER BY tanggal DESC, created_at DESC');
  
  // Ensure proper data formatting
  return result.rows.map(row => ({
    ...row,
    tanggal: row.tanggal ? new Date(row.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    jumlah: parseFloat(row.jumlah) || 0,
    saldo_sebelum: parseFloat(row.saldo_sebelum) || 0,
    saldo_sesudah: parseFloat(row.saldo_sesudah) || 0
  }));
}

export async function createKasHarian(data: Omit<KasHarian, 'id' | 'saldo_sebelum' | 'saldo_sesudah'>): Promise<KasHarian> {
  const currentSaldo = await getCurrentSaldo();
  let newSaldo = currentSaldo;
  
  if (data.jenis_transaksi === 'masuk') {
    newSaldo = currentSaldo + data.jumlah;
  } else {
    newSaldo = currentSaldo - data.jumlah;
  }
  
  const result = await pool.query(
    'INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas, bukti_transaksi, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *',
    [data.tanggal, data.jenis_transaksi, data.kategori, data.deskripsi, data.jumlah, currentSaldo, newSaldo, data.petugas, data.bukti_transaksi]
  );
  return result.rows[0];
}

// Pengeluaran functions
export async function getAllPengeluaran(): Promise<Pengeluaran[]> {
  const result = await pool.query('SELECT * FROM pengeluaran ORDER BY tanggal DESC');
  
  // Ensure proper data formatting
  return result.rows.map(row => ({
    ...row,
    tanggal: row.tanggal ? new Date(row.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    jumlah: parseFloat(row.jumlah) || 0
  }));
}

export async function createPengeluaran(data: Omit<Pengeluaran, 'id'>): Promise<Pengeluaran> {
  const result = await pool.query(
    'INSERT INTO pengeluaran (tanggal, kategori, sub_kategori, deskripsi, penerima, jumlah, metode_pembayaran, bukti_pembayaran, disetujui_oleh, status, keterangan, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *',
    [data.tanggal, data.kategori, data.sub_kategori, data.deskripsi, data.penerima, data.jumlah, data.metode_pembayaran, data.bukti_pembayaran, data.disetujui_oleh, data.status, data.keterangan]
  );
  return result.rows[0];
}

export async function approvePengeluaran(id: number, disetujuiOleh: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get pengeluaran data
    const pengeluaranResult = await client.query('SELECT * FROM pengeluaran WHERE id = $1', [id]);
    const pengeluaran = pengeluaranResult.rows[0];
    
    if (!pengeluaran) {
      throw new Error('Pengeluaran tidak ditemukan');
    }
    
    // Update status pengeluaran
    await client.query(
      'UPDATE pengeluaran SET status = $1, disetujui_oleh = $2 WHERE id = $3',
      ['disetujui', disetujuiOleh, id]
    );
    
    // Insert ke kas harian
    const currentSaldo = await getCurrentSaldo();
    const newSaldo = currentSaldo - pengeluaran.jumlah;
    
    await client.query(
      'INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [pengeluaran.tanggal, 'keluar', pengeluaran.kategori, pengeluaran.deskripsi, pengeluaran.jumlah, currentSaldo, newSaldo, disetujuiOleh]
    );
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Distribusi Zakat functions
export async function getAllDistribusiZakat(): Promise<DistribusiZakat[]> {
  const result = await pool.query(`
    SELECT d.*, m.nama as nama_mustahiq, m.kategori as kategori_mustahiq 
    FROM distribusi_zakat d 
    LEFT JOIN mustahiq m ON d.mustahiq_id = m.id 
    ORDER BY d.tanggal_distribusi DESC
  `);
  return result.rows;
}

export async function createDistribusiZakat(data: Omit<DistribusiZakat, 'id'>): Promise<DistribusiZakat> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert distribusi zakat - mapping ke struktur database yang benar
    const distribusiResult = await client.query(
      'INSERT INTO distribusi_zakat (mustahiq_id, jenis_zakat, jumlah, tanggal_distribusi, petugas, keterangan, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
      [data.mustahiq_id, data.jenis_zakat, data.jumlah, data.tanggal_distribusi, data.petugas, data.keterangan]
    );
    
    // Update kas harian
    const currentSaldo = await getCurrentSaldo();
    const newSaldo = currentSaldo - data.jumlah;
    
    await client.query(
      'INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
      [data.tanggal_distribusi, 'keluar', 'distribusi_zakat', `Distribusi zakat ${data.jenis_zakat}`, data.jumlah, currentSaldo, newSaldo, data.petugas]
    );
    
    await client.query('COMMIT');
    return distribusiResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Dashboard statistics
export async function getDashboardStats() {
  let client;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      client = await pool.connect();
      
      // Get stats with safer queries
      const [
        totalZakatFitrahResult,
        totalZakatMalResult,
        totalPengeluaranResult,
        currentSaldoResult,
        recentTransactionsResult
      ] = await Promise.all([
        client.query('SELECT COUNT(*) as count, COALESCE(SUM(total_rupiah), 0) as total FROM zakat_fitrah WHERE EXTRACT(YEAR FROM tanggal_bayar) = EXTRACT(YEAR FROM CURRENT_DATE)'),
        client.query('SELECT COUNT(*) as count, COALESCE(SUM(jumlah_zakat), 0) as total FROM zakat_mal WHERE EXTRACT(YEAR FROM tanggal_bayar) = EXTRACT(YEAR FROM CURRENT_DATE)'),
        client.query('SELECT COUNT(*) as count, COALESCE(SUM(jumlah), 0) as total FROM pengeluaran WHERE EXTRACT(YEAR FROM tanggal) = EXTRACT(YEAR FROM CURRENT_DATE)'),
        client.query('SELECT saldo_sesudah FROM kas_harian ORDER BY tanggal DESC, created_at DESC LIMIT 1'),
        client.query('SELECT * FROM kas_harian ORDER BY tanggal DESC, created_at DESC LIMIT 10')
      ]);

      // Get distribusi_zakat data
      let totalDistribusiResult = { rows: [{ count: 0, total: 0 }] };
      try {
        totalDistribusiResult = await client.query('SELECT COUNT(*) as count, COALESCE(SUM(jumlah), 0) as total FROM distribusi_zakat WHERE EXTRACT(YEAR FROM tanggal_distribusi) = EXTRACT(YEAR FROM CURRENT_DATE)');
      } catch (error) {
        console.log('distribusi_zakat table query failed, using default values:', error);
      }

      const result = {
        zakatFitrah: {
          count: parseInt(totalZakatFitrahResult.rows[0].count) || 0,
          total: parseFloat(totalZakatFitrahResult.rows[0].total) || 0
        },
        zakatMal: {
          count: parseInt(totalZakatMalResult.rows[0].count) || 0,
          total: parseFloat(totalZakatMalResult.rows[0].total) || 0
        },
        pengeluaran: {
          count: parseInt(totalPengeluaranResult.rows[0].count) || 0,
          total: parseFloat(totalPengeluaranResult.rows[0].total) || 0
        },
        distribusi: {
          count: parseInt(String(totalDistribusiResult.rows[0].count)) || 0,
          total: parseFloat(String(totalDistribusiResult.rows[0].total)) || 0
        },
        currentSaldo: parseFloat(currentSaldoResult.rows[0]?.saldo_sesudah) || 0,
        recentTransactions: recentTransactionsResult.rows || []
      };
      
      return result;
    } catch (error) {
      retryCount++;
      console.error(`Error in getDashboardStats (attempt ${retryCount}/${maxRetries}):`, error);
      
      if (client) {
        client.release();
        client = null;
      }
      
      if (retryCount >= maxRetries) {
        // Return default values if all retries failed
        console.log('All retries failed, returning default values');
        return {
          zakatFitrah: { count: 0, total: 0 },
          zakatMal: { count: 0, total: 0 },
          pengeluaran: { count: 0, total: 0 },
          distribusi: { count: 0, total: 0 },
          currentSaldo: 0,
          recentTransactions: []
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}

// DELETE FUNCTIONS
export async function deleteZakatFitrah(id: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get the zakat fitrah data before deleting
    const zakatResult = await client.query(
      'SELECT * FROM zakat_fitrah WHERE id = $1',
      [id]
    );
    
    if (zakatResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }
    
    const zakat = zakatResult.rows[0];
    
    // Delete the zakat fitrah record
    await client.query('DELETE FROM zakat_fitrah WHERE id = $1', [id]);
    
    // Update kas harian - subtract the amount
    const currentSaldo = await getCurrentSaldo();
    const newSaldo = currentSaldo - zakat.total_rupiah;
    
    await client.query(
      'INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [new Date().toISOString().split('T')[0], 'keluar', 'koreksi', `Hapus Zakat Fitrah - ${zakat.nama_muzakki}`, zakat.total_rupiah, currentSaldo, newSaldo, 'Admin']
    );
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteZakatMal(id: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get the zakat mal data before deleting
    const zakatResult = await client.query(
      'SELECT * FROM zakat_mal WHERE id = $1',
      [id]
    );
    
    if (zakatResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }
    
    const zakat = zakatResult.rows[0];
    
    // Delete the zakat mal record
    await client.query('DELETE FROM zakat_mal WHERE id = $1', [id]);
    
    // Update kas harian - subtract the amount
    const currentSaldo = await getCurrentSaldo();
    const newSaldo = currentSaldo - zakat.jumlah_zakat;
    
    await client.query(
      'INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [new Date().toISOString().split('T')[0], 'keluar', 'koreksi', `Hapus Zakat Mal - ${zakat.nama_muzakki}`, zakat.jumlah_zakat, currentSaldo, newSaldo, 'Admin']
    );
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteKasHarian(id: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM kas_harian WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export async function deletePengeluaran(id: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM pengeluaran WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteMustahiq(id: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    // With CASCADE constraint now properly set, this will automatically
    // delete related distribusi_zakat records
    const result = await client.query('DELETE FROM mustahiq WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}