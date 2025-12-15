# Sistem Manajemen Zakat Masjid

Aplikasi web untuk mengelola zakat fitrah, zakat mal, kas harian, dan pengeluaran masjid dengan interface yang user-friendly dan perhitungan otomatis. **Update terbaru**: Desain minimalist dan fitur Donatur Bulanan serta Tabungan Qurban.

## 🚀 Fitur Utama

### 📊 Dashboard
- Overview statistik zakat dan kas
- Grafik pemasukan dan pengeluaran
- Transaksi terbaru
- Summary bulanan dan tahunan

### 💰 Zakat Fitrah
- Input data muzakki dan jumlah jiwa
- Pilihan pembayaran: beras, gandum, atau uang
- Perhitungan otomatis total rupiah
- Tracking status pembayaran

### 💎 Zakat Mal
- Kalkulator zakat mal terintegrasi
- Support berbagai jenis harta (emas, perak, uang, perdagangan)
- Validasi nisab dan haul
- Perhitungan zakat otomatis (2.5%)

### 📅 Donatur Bulanan ✨ NEW
- Kelola donatur yang menyumbang rutin setiap bulan
- Auto reminder tanggal pembayaran
- Histori pembayaran lengkap
- Tracking status donatur (aktif/non-aktif)
- Integrasi otomatis dengan kas harian

### 🐑 Tabungan Qurban ✨ NEW
- Sistem tabungan hewan qurban dengan cicilan
- Support kambing, sapi, domba
- Progress tracking visual dengan progress bar
- Cicilan fleksibel kapan saja
- Auto kalkulasi sisa kekurangan
- Status otomatis (menabung → terpenuhi)

### 💵 Kas Harian
- Tracking pemasukan dan pengeluaran harian
- Kategori transaksi yang lengkap
- Real-time saldo kas
- History transaksi dengan pencarian

### 📋 Pengeluaran
- Sistem approval pengeluaran
- Kategorisasi detail (distribusi zakat, operasional, program)
- Multi-level persetujuan
- Bukti pembayaran

### 👥 Mustahiq
- Database penerima zakat
- Kategorisasi sesuai 8 asnaf
- Tracking distribusi zakat
- Status aktif/non-aktif

## 🎨 Desain Minimalist ✨ NEW

Aplikasi telah didesain ulang dengan pendekatan minimalist:
- Color palette yang lebih ringan dan modern
- Border subtle tanpa shadow berat
- Typography yang lebih clean
- Card design dengan rounded corners
- Hover effects yang smooth
- Responsive untuk semua device

## 🛠️ Teknologi

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Neon)
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Deployment**: Vercel Ready

## 📦 Instalasi

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (kami menggunakan Neon)

### Setup Project

1. **Clone/Download project ini**
2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   
   Copy `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` dengan konfigurasi Anda:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_VUnADBa5v2Wf@ep-still-resonance-a1bh691h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   NEXTAUTH_SECRET=your-secret-key-minimum-32-characters
   NEXTAUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Setup Database**
   ```bash
   npm run setup
   ```
   
   Script ini akan:
   - Membuat semua tabel yang diperlukan
   - Setup triggers dan indexes
   - Membuat user admin default
   - Insert data settings default

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Akses aplikasi di** [http://localhost:3000](http://localhost:3000)

### Login Default
- **Email**: admin@masjid.com
- **Password**: password

⚠️ **Penting**: Ganti password default setelah login pertama kali!

## 🚀 Deployment

### Vercel Deployment

1. **Push ke GitHub repository**

2. **Connect ke Vercel**
   - Import project dari GitHub
   - Set environment variables di Vercel dashboard
   - Deploy

3. **Environment Variables untuk Production**
   ```env
   DATABASE_URL=your-neon-production-url
   NEXTAUTH_SECRET=your-production-secret-key
   NEXTAUTH_URL=https://your-domain.vercel.app
   NODE_ENV=production
   ```

4. **Auto Database Setup**
   - Database akan di-setup otomatis saat build
   - Script `postbuild` akan menjalankan setup database

### Manual Database Setup (jika diperlukan)
Jika auto setup gagal, jalankan manual:
```bash
npm run setup
```

## 📝 Struktur Database

### Tabel Utama
- `users` - Data admin/user
- `zakat_fitrah` - Data penerimaan zakat fitrah  
- `zakat_mal` - Data penerimaan zakat mal
- `kas_harian` - Transaksi kas harian
- `pengeluaran` - Data pengeluaran dan approval
- `mustahiq` - Database penerima zakat
- `distribusi_zakat` - Tracking distribusi zakat
- `settings` - Konfigurasi aplikasi

### Fitur Database
- Auto-increment ID
- Timestamp tracking (created_at, updated_at)
- Foreign key relationships
- Indexes untuk performance
- Triggers untuk auto-update timestamp

## 🎨 Customization

### Mengubah Tema/Colors
Edit file `tailwind.config.ts` untuk mengubah color scheme:
```js
theme: {
  extend: {
    colors: {
      primary: {
        // Custom colors
      }
    }
  }
}
```

### Menambah Kategori
Update array `kategoriOptions` di setiap halaman untuk menambah kategori baru.

### Konfigurasi Nisab
Update tabel `settings` untuk mengubah:
- Harga emas/perak per gram
- Nisab emas/perak  
- Takaran zakat fitrah
- Tahun hijriah aktif

## 🔒 Security Features

- JWT-based authentication
- Password hashing dengan bcrypt
- SQL injection protection
- CSRF protection
- Environment variables untuk sensitive data
- Input validation dengan Zod schemas

## 📱 Responsive Design

- Mobile-first approach
- Responsive sidebar navigation
- Adaptive tables dengan horizontal scroll
- Touch-friendly interface
- Progressive Web App ready

## 🚨 Troubleshooting

### Database Connection Issues
1. Pastikan connection string benar
2. Check SSL configuration untuk production
3. Verify network access ke database

### Build Errors
1. Check semua environment variables sudah di-set
2. Pastikan TypeScript dependencies ter-install
3. Verify database dapat diakses dari build environment

### Authentication Issues
1. Check NEXTAUTH_SECRET di-set dengan benar
2. Verify NEXTAUTH_URL sesuai dengan domain
3. Clear browser cookies jika ada masalah session

## 📞 Support

Jika Anda mengalami masalah atau butuh bantuan:

1. Check dokumentasi ini dulu
2. Review error logs di console/terminal
3. Pastikan semua dependencies ter-install dengan benar
4. Verify database connection dan structure

## 📄 License

Private project untuk internal masjid. All rights reserved.

---

**Semoga aplikasi ini bermanfaat untuk memudahkan pengelolaan zakat di masjid Anda! 🤲**
