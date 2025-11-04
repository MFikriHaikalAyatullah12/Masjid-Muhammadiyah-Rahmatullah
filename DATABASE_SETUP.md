# 🗄️ Database Setup Guide

## 📋 Pilihan Setup Database

### **Option 1: Automatic Setup (Recommended)**

1. **Jalankan Script Otomatis:**
```bash
cd "d:\FILE FIKRI\PROGRAM CODINGAN\masjid"
node scripts/setup-database.js
```

2. **Script akan:**
   - ✅ Connect ke PostgreSQL Neon
   - ✅ Membuat 8 tabel utama
   - ✅ Insert default admin user
   - ✅ Insert default settings
   - ✅ Membuat indexes untuk performance

### **Option 2: Manual Setup via Neon Console**

1. **Login ke Neon Console:**
   - Buka: https://console.neon.tech
   - Login dengan akun Anda

2. **Buka SQL Editor:**
   - Pilih database `neondb`
   - Klik "SQL Editor"

3. **Copy & Paste Schema:**
   - Buka file: `database/setup-production.sql`
   - Copy semua isinya
   - Paste ke SQL Editor
   - Klik "Run"

4. **Verify Success:**
   - Pastikan muncul message "✅ Database schema berhasil dibuat!"
   - Check apakah 8 tabel sudah terbuat

### **Option 3: Command Line (psql)**

```bash
# Install psql jika belum ada
# Windows: Download PostgreSQL installer
# Mac: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Connect ke Neon
psql "postgresql://neondb_owner:npg_VUnADBa5v2Wf@ep-still-resonance-a1bh691h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Jalankan schema
\i database/setup-production.sql

# Exit
\q
```

## 🔍 Verification

Setelah setup, verify dengan query ini:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check admin user
SELECT username, email, role FROM users;

-- Check settings
SELECT key, value FROM settings;
```

## 📊 Yang Akan Dibuat:

### **Tables (8):**
1. `users` - Admin authentication
2. `mustahiq` - Penerima zakat
3. `zakat_fitrah` - Data zakat fitrah
4. `zakat_mal` - Data zakat mal
5. `kas_harian` - Transaksi kas harian
6. `pengeluaran` - Data pengeluaran
7. `distribusi_zakat` - Distribusi ke mustahiq
8. `settings` - Konfigurasi aplikasi

### **Default Data:**
- 👤 **Admin User**: admin@masjid.com / admin123
- ⚙️ **Settings**: Harga beras, nisab, nama masjid
- 📈 **Indexes**: Performance optimization

## ✅ Success Indicators:

Jika berhasil, Anda akan melihat:
- ✅ 8 tables created
- ✅ 1 admin user in users table
- ✅ 5 default settings loaded
- ✅ No error messages

## 🚨 Troubleshooting:

### **Connection Error:**
- Pastikan DATABASE_URL benar
- Check internet connection
- Verify Neon database masih aktif

### **Permission Error:**
- Pastikan user `neondb_owner` punya permission
- Check database name: `neondb`

### **Already Exists Error:**
- Normal jika menjalankan ulang
- Script menggunakan `IF NOT EXISTS`

## 🎯 Next Steps:

Setelah database setup berhasil:
1. ✅ Database schema ✓ DONE
2. 🚀 Deploy ke Vercel
3. ⚙️ Set environment variables
4. 🌐 Update NEXTAUTH_URL dengan domain Vercel

**Database sudah siap untuk production!** 🚀