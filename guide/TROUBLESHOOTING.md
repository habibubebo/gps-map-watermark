# 🔧 Troubleshooting & FAQ

## ❌ Masalah Umum

### 1. Aplikasi Tidak Membuka

**Gejala**: File index.html tidak membuka atau halaman kosong

**Solusi**:
1. Pastikan menggunakan browser modern (Chrome, Firefox, Safari, Edge)
2. Coba buka dengan browser lain
3. Cek apakah semua file (.html, .css, .js) ada di folder yang sama
4. Refresh halaman (Ctrl+R atau Cmd+R)
5. Bersihkan cache browser (Ctrl+Shift+Delete)

---

### 2. Geolocation Tidak Bekerja

**Gejala**: Tombol "Ambil Lokasi Saat Ini" tidak merespons atau error

**Solusi**:
1. **Izin Browser**: Klik "Izinkan" saat browser meminta akses lokasi
2. **Pengaturan Privasi**: 
   - Chrome: Settings → Privacy → Site Settings → Location
   - Firefox: Preferences → Privacy → Permissions → Location
3. **HTTPS**: Jika di server, pastikan menggunakan HTTPS
4. **GPS Device**: Pastikan device memiliki GPS atau internet connection
5. **Coba Manual**: Input latitude/longitude secara manual

**Catatan**: Geolocation memerlukan izin dari user dan koneksi internet.

---

### 3. Cuaca Tidak Ditemukan

**Gejala**: Error "Kota tidak ditemukan" atau data cuaca kosong

**Solusi**:
1. **Ejaan Kota**: Periksa ejaan nama kota
   - ✓ Benar: Jakarta, Bali, Surabaya
   - ✗ Salah: Jakrta, Bali Kota, Surabya
2. **Bahasa Inggris**: Gunakan nama kota dalam bahasa Inggris
   - ✓ Jakarta (bukan Djakarta)
   - ✓ Yogyakarta (bukan Jogja)
3. **Kota Besar**: Coba dengan kota yang lebih besar
4. **Internet**: Pastikan koneksi internet stabil
5. **API Status**: Open-Meteo API mungkin sedang down (jarang terjadi)

**Contoh Kota yang Bekerja**:
- Jakarta, Bandung, Surabaya, Medan, Semarang
- Bali, Yogyakarta, Makassar, Palembang
- Bogor, Tangerang, Bekasi, Depok

---

### 4. Template Tidak Tersimpan

**Gejala**: Template hilang setelah refresh atau tutup browser

**Solusi**:
1. **IndexedDB Diaktifkan**: Pastikan browser mengizinkan IndexedDB
   - Chrome: Settings → Privacy → Cookies and other site data
   - Firefox: Preferences → Privacy → Cookies and Site Data
2. **Bersihkan Cache**: Jangan hapus "Cookies and site data" saat clear cache
3. **Private/Incognito Mode**: Gunakan mode normal, bukan private
4. **Storage Penuh**: Pastikan storage device tidak penuh
5. **Browser Kompatibel**: Gunakan browser yang mendukung IndexedDB

**Cara Cek IndexedDB**:
- Buka DevTools (F12)
- Klik tab "Application" atau "Storage"
- Lihat "IndexedDB" → "WatermarkDB"

---

### 5. Gambar Tidak Tampil di Preview

**Gejala**: Upload berhasil tapi preview kosong

**Solusi**:
1. **Format Gambar**: Pastikan format didukung (JPG, PNG, WebP)
   - ✓ Didukung: .jpg, .jpeg, .png, .webp
   - ✗ Tidak: .bmp, .gif, .tiff
2. **Ukuran File**: Jika file terlalu besar (>50MB), coba compress
3. **Refresh**: Refresh halaman dan coba lagi
4. **Browser Console**: Buka DevTools (F12) → Console untuk error message
5. **Coba File Lain**: Test dengan gambar lain untuk isolasi masalah

---

### 6. Watermark Tidak Muncul

**Gejala**: Gambar diunduh tapi watermark tidak ada

**Solusi**:
1. **Centang Fitur**: Pastikan minimal satu fitur diaktifkan
   - ✓ Centang "Tampilkan GPS" atau "Tampilkan Waktu" atau "Tampilkan Cuaca"
2. **Data Lengkap**: 
   - GPS: Pastikan latitude dan longitude terisi
   - Cuaca: Pastikan data cuaca sudah diambil
3. **Preview**: Lihat preview dulu sebelum download
4. **Refresh**: Refresh halaman dan coba lagi

---

### 7. Font Terlalu Kecil/Besar

**Gejala**: Watermark tidak terlihat atau terlalu besar

**Solusi**:
1. **Ukuran Font**: Sesuaikan slider font size (8-48px)
   - Rekomendasi: 16-18px untuk kebanyakan gambar
2. **Ukuran Gambar**: Gambar kecil perlu font lebih kecil
3. **Kontras**: Pastikan warna teks kontras dengan background
4. **Preview**: Lihat preview untuk memastikan ukuran tepat

---

### 8. Warna Watermark Tidak Terlihat

**Gejala**: Watermark ada tapi tidak terlihat

**Solusi**:
1. **Kontras Warna**: 
   - Jika background gambar gelap → gunakan teks putih
   - Jika background gambar terang → gunakan teks hitam
2. **Transparansi**: Kurangi transparansi background (0.5-0.7)
3. **Warna Background**: Gunakan warna yang kontras
   - ✓ Putih teks + Hitam background
   - ✓ Hitam teks + Putih background
4. **Preview**: Lihat preview untuk memastikan terlihat

---

### 9. Download Tidak Bekerja

**Gejala**: Klik download tapi tidak ada file yang diunduh

**Solusi**:
1. **Pop-up Blocker**: Nonaktifkan pop-up blocker
   - Chrome: Settings → Privacy → Pop-ups and redirects
2. **Download Folder**: Cek folder Downloads
3. **Browser Console**: Buka DevTools (F12) → Console untuk error
4. **Coba Browser Lain**: Test dengan browser lain
5. **Refresh**: Refresh halaman dan coba lagi

---

### 10. Aplikasi Lambat/Lag

**Gejala**: Aplikasi terasa lambat atau freeze

**Solusi**:
1. **Ukuran Gambar**: Gunakan gambar dengan resolusi wajar (max 4000x3000)
2. **Browser Tab**: Tutup tab lain yang tidak perlu
3. **Memory**: Restart browser jika memory penuh
4. **Hardware**: Gunakan device dengan spesifikasi memadai
5. **Cache**: Bersihkan cache browser

---

## ❓ FAQ (Frequently Asked Questions)

### Q: Apakah perlu instalasi?
**A**: Tidak! Cukup buka file index.html di browser. Tidak perlu instalasi atau setup.

---

### Q: Apakah perlu internet?
**A**: 
- GPS: Tidak perlu (built-in di device)
- Waktu: Tidak perlu (dari device)
- Cuaca: Perlu internet untuk fetch data

---

### Q: Apakah gambar dikirim ke server?
**A**: Tidak! Semua proses terjadi di browser Anda. Gambar tidak pernah dikirim ke server.

---

### Q: Bagaimana keamanan data?
**A**: 
- Data template tersimpan lokal di IndexedDB
- Tidak ada server atau cloud storage
- Tidak ada tracking atau analytics
- Aman untuk data sensitif

---

### Q: Bisa di mobile?
**A**: Ya, tapi lebih nyaman di desktop. Mobile support ada tapi UI kurang optimal.

---

### Q: Bisa offline?
**A**: 
- GPS: Ya
- Waktu: Ya
- Cuaca: Tidak (perlu internet)
- Template: Ya (sudah tersimpan)

---

### Q: Bagaimana jika lupa template?
**A**: Template tersimpan di IndexedDB browser. Jangan hapus cache browser!

---

### Q: Bisa export/import template?
**A**: Belum di versi ini, tapi bisa ditambahkan di versi mendatang.

---

### Q: Berapa banyak template yang bisa disimpan?
**A**: Tidak ada batasan, tergantung storage device.

---

### Q: Bisa edit watermark setelah download?
**A**: Tidak, tapi bisa upload ulang dan buat watermark baru.

---

### Q: Format gambar apa yang didukung?
**A**: JPG, PNG, WebP. Format lain seperti BMP, GIF, TIFF tidak didukung.

---

### Q: Berapa ukuran file maksimal?
**A**: Tidak ada batasan hard, tapi rekomendasi max 50MB untuk performa optimal.

---

### Q: Bisa batch processing?
**A**: Tidak di versi ini, tapi bisa diproses satu per satu.

---

### Q: Apakah ada versi mobile app?
**A**: Belum, tapi bisa diakses di mobile browser.

---

### Q: Bagaimana jika ada bug?
**A**: Buka DevTools (F12) → Console untuk melihat error message, lalu laporkan.

---

### Q: Bisa customize lebih lanjut?
**A**: Ya, edit file .js dan .css sesuai kebutuhan.

---

## 🔍 Debug Mode

Untuk melihat informasi debug, buka DevTools (F12) dan lihat Console.

**Pesan Debug Umum**:
```
Database opened successfully → Database berhasil dibuka
Template saved: 1 → Template berhasil disimpan dengan ID 1
Error getting coordinates → Gagal mengambil koordinat kota
```

---

## 📞 Hubungi Support

Jika masalah tidak teratasi:
1. Buka DevTools (F12) → Console
2. Screenshot error message
3. Catat langkah-langkah yang dilakukan
4. Laporkan dengan detail

---

## 🆘 Emergency Reset

Jika aplikasi error total:

1. **Clear Cache**:
   - Chrome: Ctrl+Shift+Delete → Clear browsing data
   - Firefox: Ctrl+Shift+Delete → Clear Recent History
   - Safari: Develop → Empty Web Storage

2. **Clear IndexedDB**:
   - DevTools (F12) → Application → IndexedDB → WatermarkDB → Delete

3. **Refresh**:
   - Ctrl+Shift+R (hard refresh)

4. **Buka Ulang**:
   - Tutup browser sepenuhnya
   - Buka kembali file index.html

---

Semoga masalah Anda teratasi! 🎉
