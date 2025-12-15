#!/bin/bash

# Script untuk menambahkan fitur baru ke database
# Jalankan: bash scripts/add-new-features.sh

echo "🚀 Menambahkan fitur Donatur Bulanan dan Tabungan Qurban..."
echo ""

# Cek environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL tidak ditemukan"
    echo "Silakan set environment variable DATABASE_URL terlebih dahulu"
    exit 1
fi

echo "✅ DATABASE_URL ditemukan"
echo ""

# Jalankan migration
echo "📦 Menjalankan migration SQL..."
psql $DATABASE_URL -f database/add-new-features.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration berhasil!"
    echo ""
    echo "Fitur baru yang ditambahkan:"
    echo "  📅 Donatur Bulanan - /donatur-bulanan"
    echo "  🐑 Tabungan Qurban - /tabungan-qurban"
    echo ""
    echo "Silakan restart server dengan: npm run dev"
else
    echo ""
    echo "❌ Migration gagal!"
    echo "Periksa error di atas"
    exit 1
fi
