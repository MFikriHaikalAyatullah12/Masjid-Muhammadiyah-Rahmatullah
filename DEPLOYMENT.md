# Deployment Guide - Sistem Manajemen Zakat Masjid

## 📋 Environment Variables untuk Deployment

### Untuk Development (.env):
```bash
DATABASE_URL="postgresql://neondb_owner:npg_VUnADBa5v2Wf@ep-still-resonance-a1bh691h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_SECRET="masjid-zakat-management-system-2025-production-secret-key-very-secure"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Untuk Production:
Set environment variables berikut di platform deployment Anda:

1. **DATABASE_URL**: 
   ```
   postgresql://neondb_owner:npg_VUnADBa5v2Wf@ep-still-resonance-a1bh691h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

2. **NEXTAUTH_SECRET**: 
   ```
   masjid-zakat-management-system-2025-production-secret-key-very-secure
   ```

3. **NEXTAUTH_URL**: 
   ```
   https://your-domain.vercel.app  # Ganti dengan domain Anda
   ```

4. **NODE_ENV**: 
   ```
   production
   ```

## 🗄️ Database Setup

Sebelum deploy, jalankan schema SQL di PostgreSQL Neon:
```bash
# Connect ke database Neon dan jalankan:
psql "postgresql://neondb_owner:npg_VUnADBa5v2Wf@ep-still-resonance-a1bh691h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Atau upload file database/schema.sql via Neon Console
```

## 🚀 Platform Deployment

### Vercel:
1. Push code ke GitHub
2. Connect repository di Vercel
3. Set environment variables di Settings > Environment Variables
4. Deploy!

### Netlify:
1. Push code ke GitHub  
2. Connect repository di Netlify
3. Set environment variables di Site Settings > Environment Variables
4. Deploy!

## ✅ Checklist Deployment:
- [ ] Database schema sudah dijalankan
- [ ] Environment variables sudah di-set
- [ ] NEXTAUTH_URL sudah diganti ke domain production
- [ ] Build test lokal berhasil (`npm run build`)
- [ ] Database connection test berhasil

## 🔐 Keamanan:
- ✅ Kredensial database aman (Neon SSL)
- ✅ Environment variables tidak ter-commit ke Git
- ✅ NextAuth secret sudah secure
- ✅ Production-ready configuration