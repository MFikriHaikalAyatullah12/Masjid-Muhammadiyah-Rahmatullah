# Troubleshooting Guide - Fitur Baru

## ✅ Setup Berhasil!

Database telah dikonfigurasi dengan sukses. Berikut adalah rangkuman:

### Tabel yang Dibuat:
- ✅ `donatur_bulanan` - Data donatur bulanan
- ✅ `pembayaran_donatur` - Histori pembayaran donatur
- ✅ `tabungan_qurban` - Data tabungan qurban
- ✅ `cicilan_qurban` - Histori cicilan
- ✅ `pengambilan_qurban` - Data pengambilan hewan

### Logging untuk Debug:

Sekarang semua form memiliki console.log untuk debugging:

**Browser Console (F12):**
- Form submission data
- Response status
- Response data
- Error messages

**Terminal (npm run dev):**
- Received data di API
- Validation checks
- Database insert results
- Error details

---

## 🔍 Cara Debug Jika Masalah Terjadi:

### 1. Buka Browser Console (F12)
Saat submit form, cek console untuk:
```
Submitting form data: { nama: "...", jumlah_donasi: 50000, ... }
Response status: 201
Response data: { success: true, data: {...} }
```

### 2. Cek Terminal Server
Lihat log di terminal yang menjalankan `npm run dev`:
```
Received donatur data: { nama: "...", ... }
Inserting to database...
Insert successful: { id: 1, ... }
```

### 3. Test Manual API dengan cURL:

**Tambah Donatur:**
```bash
curl -X POST http://localhost:3000/api/donatur-bulanan \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User",
    "jumlah_donasi": 50000,
    "tanggal_mulai": "2025-01-15"
  }'
```

**Tambah Tabungan:**
```bash
curl -X POST http://localhost:3000/api/tabungan-qurban \
  -H "Content-Type: application/json" \
  -d '{
    "nama_penabung": "Test User",
    "jenis_hewan": "kambing",
    "target_tabungan": 3000000,
    "tanggal_mulai": "2025-01-15",
    "target_qurban_tahun": 1446
  }'
```

---

## ⚠️ Error Common & Solusi:

### Error: "Validation failed"
**Penyebab:** Field required tidak diisi
**Solusi:** 
- Donatur: Pastikan `nama`, `jumlah_donasi`, `tanggal_mulai` terisi
- Tabungan: Pastikan `nama_penabung`, `jenis_hewan`, `target_tabungan`, `tanggal_mulai`, `target_qurban_tahun` terisi

### Error: "Database connection failed"
**Penyebab:** `.env.local` tidak terbaca
**Solusi:**
```bash
# Pastikan file .env.local ada
cat .env.local

# Restart server
# Ctrl+C di terminal npm run dev
npm run dev
```

### Error: "Table does not exist"
**Penyebab:** Database belum di-setup
**Solusi:**
```bash
node scripts/setup-new-features.js
```

### Error: "CORS" atau "Network Error"
**Penyebab:** Server tidak running
**Solusi:**
```bash
npm run dev
```

---

## ✅ Checklist Verifikasi:

- [x] Database tables created
- [x] .env.local file exists
- [x] Server running (npm run dev)
- [ ] Form bisa dibuka
- [ ] Console log muncul saat submit
- [ ] Data tersimpan di database
- [ ] Alert sukses muncul
- [ ] List terupdate

---

## 🧪 Test Cases:

### Test 1: Tambah Donatur Bulanan
1. Buka `/donatur-bulanan`
2. Klik "Tambah Donatur"
3. Isi form:
   - Nama: "Ahmad Ibrahim"
   - Jumlah Donasi: 500000
   - Tanggal Mulai: Hari ini
4. Klik "Simpan"
5. **Expected:** Alert hijau "Donatur berhasil ditambahkan!"
6. **Expected:** Card donatur muncul di list

### Test 2: Catat Pembayaran Donatur
1. Klik "Catat Bayar" pada card donatur
2. Isi form pembayaran
3. Klik "Simpan"
4. **Expected:** Alert "Pembayaran berhasil dicatat!"

### Test 3: Tambah Tabungan Qurban
1. Buka `/tabungan-qurban`
2. Klik "Buat Tabungan"
3. Isi form:
   - Nama: "Budi Santoso"
   - Jenis Hewan: Kambing
   - Target: 3000000
   - Tanggal Mulai: Hari ini
   - Target Tahun: 1446
4. Klik "Simpan"
5. **Expected:** Alert "Tabungan qurban berhasil dibuat!"
6. **Expected:** Card tabungan muncul dengan progress bar 0%

### Test 4: Bayar Cicilan
1. Klik "Bayar Cicilan" pada card tabungan
2. Isi jumlah: 500000
3. Klik "Bayar"
4. **Expected:** Progress bar update
5. **Expected:** Persentase berubah (misal: 16.67%)

---

## 📞 Jika Masih Error:

1. Screenshot error di browser console
2. Copy error dari terminal
3. Cek network tab di browser (F12 → Network)
4. Pastikan status code response (200, 201, 400, 500?)

---

**Status Saat Ini:** ✅ READY TO USE

Fitur sudah siap digunakan dengan logging lengkap untuk debugging!
