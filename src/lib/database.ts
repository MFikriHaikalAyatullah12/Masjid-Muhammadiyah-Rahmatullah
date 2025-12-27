import pool from './db';
import bcryptjs from 'bcryptjs';
import type { User, UserFromDB, ZakatFitrah, ZakatMal, KasHarian, Pengeluaran, Mustahiq, DistribusiZakat } from './schemas';

// Export pool for direct access
export { default as pool } from './db';

// Helper function untuk mendapatkan saldo kas terkini per user - NEON OPTIMIZED
export async function getCurrentSaldo(userId?: number): Promise<number> {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      let query = 'SELECT saldo_sesudah FROM kas_harian';
      const params: any[] = [];
      
      if (userId) {
        query += ' WHERE user_id = $1';
        params.push(userId);
      }
      
      query += ' ORDER BY tanggal DESC, created_at DESC LIMIT 1';
      
      const result = await pool.query(query, params);
      return result.rows.length > 0 ? parseFloat(result.rows[0].saldo_sesudah) || 0 : 0;
    } catch (error: any) {
      retryCount++;
      console.error(`Error getting current saldo (attempt ${retryCount}/${maxRetries}):`, error);
      
      // Retry for timeout/connection errors
      if (retryCount < maxRetries && (
        error.message?.includes('timeout') || 
        error.message?.includes('connect') ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT'
      )) {
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        continue;
      }
      
      console.error('Final error getting current saldo:', error);
      return 0;
    }
  }
  return 0;
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
  try {
    // ULTRA OPTIMIZED with LIMIT for speed
    const result = await pool.query('SELECT * FROM mustahiq ORDER BY nama ASC LIMIT 500');
    return result.rows;
  } catch (error) {
    console.error('Error fetching mustahiq:', error);
    return [];
  }
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
  try {
    // ULTRA OPTIMIZED with LIMIT for speed
    const result = await pool.query('SELECT * FROM zakat_fitrah ORDER BY tanggal_bayar DESC LIMIT 200');
    
    // Minimal processing for speed
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
  } catch (error) {
    console.error('Error fetching zakat fitrah:', error);
    return [];
  }
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
export async function getAllZakatMal(userId?: number): Promise<ZakatMal[]> {
  try {
    // ULTRA OPTIMIZED with LIMIT for speed and user isolation
    let query = 'SELECT * FROM zakat_mal';
    const params: any[] = [];
    
    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY tanggal_bayar DESC LIMIT 200';
    
    const result = await pool.query(query, params);
    
    // Minimal processing for speed
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
  } catch (error) {
    console.error('Error fetching zakat mal:', error);
    return [];
  }
}

export async function createZakatMal(data: Omit<ZakatMal, 'id'>, userId?: number): Promise<ZakatMal> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert zakat mal - mapping dari interface ke database with user_id
    const zakatResult = await client.query(
      'INSERT INTO zakat_mal (nama_muzakki, jenis_harta, nilai_harta, nisab, jumlah_zakat, tanggal_bayar, tahun_hijriah, keterangan, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *',
      [data.nama_muzakki, data.jenis_harta, data.nilai_harta, data.nisab, data.jumlah_zakat, data.tanggal_bayar, data.tahun_hijriah || new Date().getFullYear().toString(), data.keterangan, userId]
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
export async function getAllKasHarian(userId?: number): Promise<KasHarian[]> {
  try {
    // ULTRA OPTIMIZED single query with essential columns only
    let query = `
      SELECT 
        id, tanggal, jenis_transaksi, kategori, deskripsi, jumlah,
        saldo_sebelum, saldo_sesudah, petugas, bukti_transaksi, created_at
      FROM kas_harian`;
    
    const params: any[] = [];
    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }
    
    // Limit optimized for speed vs completeness
    query += ' ORDER BY tanggal DESC, created_at DESC LIMIT 200';
    
    const result = await pool.query(query, params);
    
    // Minimal processing for maximum speed
    return result.rows.map(row => ({
      id: row.id,
      tanggal: row.tanggal ? new Date(row.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      jenis_transaksi: row.jenis_transaksi,
      kategori: row.kategori,
      deskripsi: row.deskripsi,
      jumlah: parseFloat(row.jumlah) || 0,
      saldo_sebelum: parseFloat(row.saldo_sebelum) || 0,
      saldo_sesudah: parseFloat(row.saldo_sesudah) || 0,
      petugas: row.petugas || '',
      bukti_transaksi: row.bukti_transaksi || '',
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error getting kas harian:', error);
    return [];
  }
}

export async function createKasHarian(data: any, userId: number): Promise<KasHarian> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get current saldo with optimized query
    const saldoResult = await client.query(
      'SELECT saldo_sesudah FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 1',
      [userId]
    );
    
    const currentSaldo = saldoResult.rows.length > 0 ? parseFloat(saldoResult.rows[0].saldo_sesudah) || 0 : 0;
    const newSaldo = data.jenis_transaksi === 'masuk' 
      ? currentSaldo + data.jumlah 
      : currentSaldo - data.jumlah;
    
    const result = await client.query(
      `INSERT INTO kas_harian (
        tanggal, jenis_transaksi, kategori, deskripsi, jumlah, 
        saldo_sebelum, saldo_sesudah, petugas, bukti_transaksi, user_id, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
      [
        data.tanggal, data.jenis_transaksi, data.kategori, data.deskripsi, 
        data.jumlah, currentSaldo, newSaldo, data.petugas, 
        data.bukti_transaksi, userId
      ]
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Pengeluaran functions
export async function getAllPengeluaran(userId?: number): Promise<Pengeluaran[]> {
  try {
    // ULTRA OPTIMIZED with LIMIT for speed and optional user isolation
    let query = 'SELECT * FROM pengeluaran';
    const params: any[] = [];
    
    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY tanggal DESC LIMIT 200';
    
    const result = await pool.query(query, params);
    
    // Minimal processing for speed
    return result.rows.map(row => ({
      ...row,
      tanggal: row.tanggal ? new Date(row.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      jumlah: parseFloat(row.jumlah) || 0
    }));
  } catch (error) {
    console.error('Error fetching pengeluaran:', error);
    return [];
  }
}

export async function createPengeluaran(data: any, userId: number): Promise<Pengeluaran> {
  const result = await pool.query(
    'INSERT INTO pengeluaran (tanggal, kategori, sub_kategori, deskripsi, penerima, jumlah, metode_pembayaran, bukti_pembayaran, disetujui_oleh, status, keterangan, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING *',
    [data.tanggal, data.kategori, data.sub_kategori, data.deskripsi, data.penerima, data.jumlah, data.metode_pembayaran, data.bukti_pembayaran, data.disetujui_oleh, data.status, data.keterangan, userId]
  );
  return result.rows[0];
}

export async function approvePengeluaran(id: number, disetujuiOleh: string, userId?: number): Promise<void> {
  try {
    // INSTANT APPROVAL - Parallel operations for speed
    const [pengeluaranResult] = await Promise.all([
      pool.query('SELECT * FROM pengeluaran WHERE id = $1', [id]),
    ]);
    
    const pengeluaran = pengeluaranResult.rows[0];
    if (!pengeluaran) {
      throw new Error('Pengeluaran tidak ditemukan');
    }
    
    // INSTANT UPDATE - No transaction overhead
    await pool.query(
      'UPDATE pengeluaran SET status = $1, disetujui_oleh = $2, updated_at = NOW() WHERE id = $3',
      ['disetujui', disetujuiOleh, id]
    );
    
    // BACKGROUND kas harian insert (non-blocking for instant UI response)
    setImmediate(async () => {
      try {
        // Get current saldo in background
        let currentSaldo = 0;
        try {
          const saldoResult = await pool.query(
            userId 
              ? 'SELECT saldo_sesudah FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 1'
              : 'SELECT saldo_sesudah FROM kas_harian ORDER BY tanggal DESC, created_at DESC LIMIT 1',
            userId ? [userId] : []
          );
          currentSaldo = saldoResult.rows.length > 0 ? parseFloat(saldoResult.rows[0].saldo_sesudah) || 0 : 0;
        } catch (error) {
          console.error('Error getting saldo for approval:', error);
        }
        
        const newSaldo = currentSaldo - parseFloat(pengeluaran.jumlah);
        
        // Background insert to kas_harian
        await pool.query(
          userId
            ? 'INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())'
            : 'INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
          userId 
            ? [pengeluaran.tanggal, 'keluar', pengeluaran.kategori, pengeluaran.deskripsi, pengeluaran.jumlah, currentSaldo, newSaldo, disetujuiOleh, userId]
            : [pengeluaran.tanggal, 'keluar', pengeluaran.kategori, pengeluaran.deskripsi, pengeluaran.jumlah, currentSaldo, newSaldo, disetujuiOleh]
        );
      } catch (error) {
        console.error('Background kas harian insert error:', error);
      }
    });
    
  } catch (error) {
    console.error('Error approving pengeluaran:', error);
    throw error;
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
export async function getDashboardStats(userId: number) {
  let client;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      client = await pool.connect();
      
      // Get stats with safer queries filtered by user_id
      const [
        totalZakatFitrahResult,
        totalZakatMalResult,
        totalPengeluaranResult,
        currentSaldoResult,
        recentTransactionsResult
      ] = await Promise.all([
        client.query('SELECT COUNT(*) as count, COALESCE(SUM(total_rupiah), 0) as total FROM zakat_fitrah WHERE user_id = $1 AND EXTRACT(YEAR FROM tanggal_bayar) = EXTRACT(YEAR FROM CURRENT_DATE)', [userId]),
        client.query('SELECT COUNT(*) as count, COALESCE(SUM(jumlah_zakat), 0) as total FROM zakat_mal WHERE user_id = $1 AND EXTRACT(YEAR FROM tanggal_bayar) = EXTRACT(YEAR FROM CURRENT_DATE)', [userId]),
        client.query('SELECT COUNT(*) as count, COALESCE(SUM(jumlah), 0) as total FROM pengeluaran WHERE user_id = $1 AND EXTRACT(YEAR FROM tanggal) = EXTRACT(YEAR FROM CURRENT_DATE)', [userId]),
        client.query('SELECT saldo_sesudah FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 1', [userId]),
        client.query('SELECT * FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 10', [userId])
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

export async function deleteZakatMal(id: number, userId?: number): Promise<boolean> {
  try {
    // INSTANT DELETE - No transaction overhead
    let query = 'DELETE FROM zakat_mal WHERE id = $1';
    const params = [id];
    
    // Add user_id filter only if userId is provided (for user isolation)
    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }
    
    query += ' RETURNING id';
    
    const deleteResult = await pool.query(query, params);
    return deleteResult.rowCount !== null && deleteResult.rowCount > 0;
  } catch (error) {
    console.error('Error deleting zakat mal:', error);
    return false;
  }
}

export async function deleteKasHarian(id: number, userId: number): Promise<boolean> {
  try {
    // INSTANT DELETE - No transaction overhead for maximum speed
    const deleteResult = await pool.query(
      'DELETE FROM kas_harian WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    const success = deleteResult.rowCount !== null && deleteResult.rowCount > 0;
    
    // BACKGROUND saldo recalculation (non-blocking for instant UI response)
    if (success) {
      setImmediate(async () => {
        try {
          await pool.query(`
            WITH sequential_kas AS (
              SELECT 
                id,
                jenis_transaksi,
                jumlah,
                ROW_NUMBER() OVER (ORDER BY tanggal ASC, created_at ASC) as rn
              FROM kas_harian 
              WHERE user_id = $1
            ),
            calculated_saldo AS (
              SELECT 
                id,
                CASE 
                  WHEN rn = 1 THEN 0
                  ELSE SUM(
                    CASE WHEN jenis_transaksi = 'masuk' THEN jumlah ELSE -jumlah END
                  ) OVER (ORDER BY rn ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING)
                END as new_saldo_sebelum,
                SUM(
                  CASE WHEN jenis_transaksi = 'masuk' THEN jumlah ELSE -jumlah END
                ) OVER (ORDER BY rn ROWS UNBOUNDED PRECEDING) as new_saldo_sesudah
              FROM sequential_kas
            )
            UPDATE kas_harian 
            SET 
              saldo_sebelum = calculated_saldo.new_saldo_sebelum,
              saldo_sesudah = calculated_saldo.new_saldo_sesudah
            FROM calculated_saldo 
            WHERE kas_harian.id = calculated_saldo.id
          `, [userId]);
        } catch (error) {
          console.error('Background saldo recalculation error:', error);
        }
      });
    }
    
    return success;
  } catch (error) {
    console.error('Error deleting kas harian:', error);
    return false;
  }
}

export async function deleteZakatFitrah(id: number, userId: number): Promise<boolean> {
  try {
    // INSTANT DELETE - No transaction overhead
    const deleteResult = await pool.query(
      'DELETE FROM zakat_fitrah WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    return deleteResult.rowCount !== null && deleteResult.rowCount > 0;
  } catch (error) {
    console.error('Error deleting zakat fitrah:', error);
    return false;
  }
}

export async function deletePengeluaran(id: number, userId: number): Promise<boolean> {
  try {
    // INSTANT DELETE - No transaction overhead
    const deleteResult = await pool.query(
      'DELETE FROM pengeluaran WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    return deleteResult.rowCount !== null && deleteResult.rowCount > 0;
  } catch (error) {
    console.error('Error deleting pengeluaran:', error);
    return false;
  }
}

export async function deleteMustahiq(id: number, userId: number): Promise<boolean> {
  try {
    // INSTANT DELETE - No transaction overhead, CASCADE will handle relations
    const deleteResult = await pool.query(
      'DELETE FROM mustahiq WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    return deleteResult.rowCount !== null && deleteResult.rowCount > 0;
  } catch (error) {
    console.error('Error deleting mustahiq:', error);
    return false;
  }
}