# 📸 Image Watermark Pro

Aplikasi web untuk menambahkan watermark GPS, waktu, dan cuaca pada gambar dengan sistem template yang dapat disimpan dan dikustomisasi.

## ✨ Fitur Utama

### 📍 GPS Watermark
- Tampilkan koordinat latitude dan longitude pada gambar
- Ambil lokasi otomatis menggunakan Geolocation API
- Input manual untuk koordinat spesifik

### 🕐 Waktu Watermark
- Tampilkan tanggal dan waktu saat ini
- Pilih format: Lengkap, Tanggal Saja, atau Waktu Saja
- Format: DD/MM/YYYY HH:MM:SS

### 🌤️ Cuaca Watermark
- Tampilkan kondisi cuaca dan suhu
- Cari berdasarkan nama kota
- Menggunakan Open-Meteo API (gratis, tanpa API key)

### 🎨 Kustomisasi Gaya
- Ukuran font yang dapat disesuaikan (8-48px)
- Pilih warna teks dan latar belakang
- Kontrol transparansi latar belakang
- Posisi watermark: Bawah Kiri, Bawah Kanan, Atas Kiri, Atas Kanan

### 💾 Sistem Template
- Simpan pengaturan sebagai template
- Kelola multiple template dengan nama berbeda
- Update atau hapus template yang sudah ada
- Setiap template menyimpan semua pengaturan

### 💾 Database Lokal
- Menggunakan IndexedDB (browser database)
- Tidak perlu server atau service tambahan
- Data tersimpan lokal di browser
- Sinkronisasi otomatis

## 🚀 Cara Menggunakan

### 1. Buka Aplikasi
- Buka file `index.html` di browser modern (Chrome, Firefox, Safari, Edge)
- Aplikasi akan memuat dan siap digunakan

### 2. Upload Gambar
- Klik area upload atau drag-drop gambar
- Format yang didukung: JPG, PNG, WebP
- Preview akan ditampilkan secara real-time

### 3. Konfigurasi Watermark

#### GPS
- Centang "Tampilkan GPS" untuk mengaktifkan
- Klik "Ambil Lokasi Saat Ini" untuk geolocation otomatis
- Atau input manual latitude dan longitude

#### Waktu
- Centang "Tampilkan Waktu" untuk mengaktifkan
- Pilih format waktu yang diinginkan

#### Cuaca
- Centang "Tampilkan Cuaca" untuk mengaktifkan
- Masukkan nama kota
- Klik "Ambil Cuaca Saat Ini" untuk fetch data

#### Gaya
- Sesuaikan ukuran font
- Pilih warna teks dan background
- Atur transparansi
- Pilih posisi watermark

### 4. Simpan Template
- Masukkan nama template
- Klik "Simpan Template"
- Template akan tersimpan di database lokal

### 5. Download Gambar
- Klik "Download Gambar" untuk menyimpan hasil
- File akan diunduh dengan nama: `watermarked-[timestamp].png`

## 📁 Struktur File

```
gps-map-watermark/
├── index.html          # File HTML utama
├── styles.css          # Styling dan layout
├── db.js              # Database manager (IndexedDB)
├── weather.js         # Weather API manager
├── watermark.js       # Watermark drawing engine
├── app.js             # Main application logic
└── README.md          # Dokumentasi ini
```

## 🔧 Teknologi yang Digunakan

- **HTML5**: Struktur aplikasi
- **CSS3**: Styling responsif
- **JavaScript (ES6+)**: Logika aplikasi
- **Canvas API**: Drawing watermark pada gambar
- **IndexedDB**: Database lokal browser
- **Geolocation API**: Ambil koordinat GPS
- **Open-Meteo API**: Data cuaca gratis

## 📋 Persyaratan Browser

- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+
- Opera 15+

Semua browser modern yang mendukung:
- IndexedDB
- Canvas API
- Geolocation API
- Fetch API

## 🎯 Contoh Penggunaan

### Template Liburan
```
Nama: Template Liburan
GPS: Aktif
Waktu: Format Lengkap
Cuaca: Aktif (Kota: Bali)
Font: 18px
Warna: Putih (#FFFFFF)
Background: Hitam (#000000)
Transparansi: 70%
Posisi: Bawah Kanan
```

### Template Dokumentasi
```
Nama: Template Dokumentasi
GPS: Aktif
Waktu: Tanggal Saja
Cuaca: Tidak Aktif
Font: 14px
Warna: Putih (#FFFFFF)
Background: Biru (#0066CC)
Transparansi: 80%
Posisi: Atas Kiri
```

## 🔐 Keamanan & Privacy

- Semua pemrosesan dilakukan di browser (client-side)
- Gambar tidak dikirim ke server
- Data template tersimpan lokal di IndexedDB
- Tidak ada tracking atau analytics
- Geolocation hanya digunakan saat user mengklik tombol

## 💡 Tips & Trik

1. **Backup Template**: Export data IndexedDB secara berkala
2. **Ukuran Font**: Gunakan 16-20px untuk hasil optimal
3. **Transparansi**: 0.7 (70%) cocok untuk kebanyakan background
4. **Posisi**: Pilih posisi yang tidak menutupi subjek utama gambar
5. **Cuaca**: Pastikan nama kota benar untuk hasil akurat

## 🐛 Troubleshooting

### Geolocation tidak bekerja
- Pastikan browser meminta izin lokasi
- Gunakan HTTPS (jika di server)
- Cek pengaturan privacy browser

### Cuaca tidak ditemukan
- Periksa ejaan nama kota
- Gunakan nama kota dalam bahasa Inggris
- Coba kota yang lebih besar

### Template tidak tersimpan
- Bersihkan cache browser
- Cek apakah IndexedDB diaktifkan
- Coba browser lain

### Gambar tidak tampil
- Pastikan format gambar didukung (JPG, PNG, WebP)
- Cek ukuran file (max ~50MB)
- Coba refresh halaman

## 📝 Lisensi

Bebas digunakan untuk keperluan pribadi dan komersial.

## 🤝 Kontribusi

Silakan fork dan buat pull request untuk improvement.

## 📞 Support

Untuk pertanyaan atau bug report, silakan buat issue di repository.

---

**Dibuat dengan ❤️ untuk memudahkan watermarking gambar**
