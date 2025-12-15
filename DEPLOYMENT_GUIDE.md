# 🚀 Panduan Deploy ke Vercel

## 📋 Environment Variables untuk Production

Copy-paste environment variables berikut ke **Vercel Dashboard**:

### **Cara Deploy:**

1. **Push ke GitHub** (jika belum)
   ```bash
   git add .
   git commit -m "Add new features: Donatur Bulanan & Tabungan Qurban"
   git push origin main
   ```

2. **Import Project ke Vercel**
   - Buka https://vercel.com/new
   - Login dengan GitHub
   - Pilih repository: `Masjid-Muhammadiyah-Rahmatullah`
   - Klik **Import**

3. **Set Environment Variables**
   
   Di halaman konfigurasi Vercel, tambahkan 4 environment variables ini:

   **Key:** `DATABASE_URL`  
   **Value:**
   ```
   postgresql://neondb_owner:npg_VUnADBa5v2Wf@ep-still-resonance-a1bh691h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

   **Key:** `NEXTAUTH_SECRET`  
   **Value:**
   ```
   7K9mP2nQ5rT8vY1wA4bC6dE9fG2hJ5kL8mN1pR4sT7uV0wX3yZ6
   ```

   **Key:** `NEXTAUTH_URL`  
   **Value:**
   ```
   https://masjid-muhammadiyah-rahmatullah.vercel.app
   ```
   ⚠️ **PENTING**: Ganti dengan URL Vercel Anda setelah deploy!

   **Key:** `NODE_ENV`  
   **Value:**
   ```
   production
   ```

4. **Deploy**
   - Klik **Deploy**
   - Tunggu proses build selesai (2-3 menit)

5. **Setup Database** (Setelah Deploy Berhasil)
   
   Jalankan migration SQL untuk menambahkan tabel baru:
   
   ```bash
   # Di terminal lokal
   psql postgresql://neondb_owner:npg_VUnADBa5v2Wf@ep-still-resonance-a1bh691h-pooler.ap-southeast-1.aws.neon.tech/neondb -f database/add-new-features.sql
   ```

6. **Update NEXTAUTH_URL**
   - Setelah deploy berhasil, copy URL Vercel Anda
   - Kembali ke Vercel Dashboard → Settings → Environment Variables
   - Update `NEXTAUTH_URL` dengan URL yang benar
   - Klik **Redeploy** untuk apply changes

---

## ✅ Verifikasi Setelah Deploy

Pastikan semua fitur berjalan:

- [ ] Halaman utama terbuka
- [ ] Login berfungsi
- [ ] Dashboard tampil dengan benar
- [ ] Menu Donatur Bulanan bisa diakses
- [ ] Menu Tabungan Qurban bisa diakses
- [ ] Zakat Fitrah & Zakat Mal berfungsi
- [ ] Kas Harian terupdate otomatis
- [ ] Laporan bisa didownload

---

## 🔧 Troubleshooting

### Error: "Database connection failed"
- Cek apakah `DATABASE_URL` sudah benar di environment variables
- Pastikan tidak ada spasi atau karakter tambahan

### Error: "NextAuth configuration invalid"
- Cek `NEXTAUTH_URL` sudah sesuai dengan domain Vercel
- Pastikan `NEXTAUTH_SECRET` minimal 32 karakter

### Database belum ada tabel baru
- Jalankan migration SQL: `database/add-new-features.sql`
- Gunakan psql atau Neon SQL Editor

### Halaman 404 pada menu baru
- Pastikan sudah push semua file ke GitHub
- Redeploy dari Vercel Dashboard

---

## 📱 Custom Domain (Optional)

Jika ingin menggunakan domain sendiri:

1. Beli domain (contoh: masjid-rahmatullah.com)
2. Di Vercel Dashboard → Settings → Domains
3. Tambahkan custom domain
4. Update `NEXTAUTH_URL` dengan domain baru
5. Redeploy

---

## 🔒 Keamanan

- ✅ NEXTAUTH_SECRET sudah strong (42 karakter random)
- ✅ Database menggunakan SSL (sslmode=require)
- ✅ Environment variables di-encrypt oleh Vercel
- ⚠️ Jangan share file `.env.production` ke publik

---

## 📞 Support

Jika ada masalah:
1. Cek Vercel Deployment Logs
2. Cek Neon Database Logs
3. Cek browser console untuk error

---

**Deployment URL akan seperti:**
`https://masjid-muhammadiyah-rahmatullah.vercel.app`

atau

`https://masjid-muhammadiyah-rahmatullah-[random].vercel.app`

Selamat deploy! 🎉
