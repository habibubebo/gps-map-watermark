# 🧪 Testing Guide

## Checklist Testing

### ✅ Fitur Dasar

- [ ] Aplikasi membuka di browser
- [ ] Sidebar template terlihat
- [ ] Tab "Upload & Preview" aktif
- [ ] Tab "Pengaturan Template" bisa diklik
- [ ] Upload area terlihat dengan placeholder

### ✅ Upload Gambar

- [ ] Klik upload area membuka file picker
- [ ] Drag-drop gambar bekerja
- [ ] Gambar ditampilkan di preview
- [ ] Tombol "Download" dan "Reset" aktif
- [ ] Format JPG, PNG, WebP diterima
- [ ] Format lain (BMP, GIF) ditolak

### ✅ GPS Watermark

- [ ] Checkbox "Tampilkan GPS" bisa diklik
- [ ] Input latitude dan longitude bisa diisi
- [ ] Tombol "Ambil Lokasi Saat Ini" bekerja
- [ ] Koordinat muncul di preview
- [ ] Format: "📍 -6.2088, 106.8456"
- [ ] Geolocation permission diminta

### ✅ Waktu Watermark

- [ ] Checkbox "Tampilkan Waktu" bisa diklik
- [ ] Dropdown format waktu bisa dipilih
- [ ] Format "Lengkap" menampilkan: DD/MM/YYYY HH:MM:SS
- [ ] Format "Tanggal Saja" menampilkan: DD/MM/YYYY
- [ ] Format "Waktu Saja" menampilkan: HH:MM:SS
- [ ] Waktu update real-time

### ✅ Cuaca Watermark

- [ ] Checkbox "Tampilkan Cuaca" bisa diklik
- [ ] Input kota bisa diisi
- [ ] Tombol "Ambil Cuaca Saat Ini" bekerja
- [ ] Data cuaca ditampilkan (suhu, kondisi)
- [ ] Format: "☀️ Cerah 28°C"
- [ ] Error handling untuk kota tidak ditemukan

### ✅ Gaya Watermark

- [ ] Slider font size berfungsi (8-48px)
- [ ] Color picker untuk teks bekerja
- [ ] Color picker untuk background bekerja
- [ ] Slider transparansi berfungsi (0-100%)
- [ ] Dropdown posisi bisa dipilih
- [ ] Preview update real-time saat perubahan

### ✅ Template Management

- [ ] Tombol "Template Baru" membuka modal
- [ ] Input nama template di modal
- [ ] Tombol "Buat" membuat template baru
- [ ] Tombol "Batal" menutup modal
- [ ] Template muncul di sidebar
- [ ] Klik template memuat pengaturannya
- [ ] Tombol "Simpan Template" menyimpan
- [ ] Tombol "Hapus Template" menghapus
- [ ] Konfirmasi sebelum hapus

### ✅ Download

- [ ] Tombol "Download Gambar" aktif saat ada gambar
- [ ] Klik download mengunduh file PNG
- [ ] Nama file: watermarked-[timestamp].png
- [ ] File berisi watermark yang benar
- [ ] Watermark terlihat jelas di gambar

### ✅ Reset

- [ ] Tombol "Reset" menghapus gambar
- [ ] Preview kosong setelah reset
- [ ] Tombol download dan reset disabled
- [ ] Bisa upload gambar baru setelah reset

### ✅ Responsif

- [ ] Aplikasi terlihat baik di desktop
- [ ] Aplikasi terlihat baik di tablet
- [ ] Aplikasi terlihat baik di mobile
- [ ] Sidebar bisa di-scroll
- [ ] Preview bisa di-scroll
- [ ] Tidak ada horizontal scroll

### ✅ Database

- [ ] Template tersimpan di IndexedDB
- [ ] Template persist setelah refresh
- [ ] Template persist setelah tutup browser
- [ ] Bisa simpan multiple template
- [ ] Bisa update template
- [ ] Bisa hapus template

### ✅ Performance

- [ ] Aplikasi load cepat
- [ ] Preview update smooth
- [ ] Download tidak lag
- [ ] Tidak ada memory leak
- [ ] Bisa handle gambar besar

---

## Test Cases

### Test Case 1: Basic Watermark

**Tujuan**: Verifikasi watermark dasar bekerja

**Langkah**:
1. Buka aplikasi
2. Upload gambar JPG
3. Aktifkan GPS, Waktu, Cuaca
4. Klik "Ambil Lokasi Saat Ini"
5. Klik "Ambil Cuaca Saat Ini" (masukkan kota)
6. Lihat preview
7. Download gambar

**Expected Result**:
- Preview menampilkan watermark dengan GPS, waktu, cuaca
- File terunduh dengan watermark

---

### Test Case 2: Template Saving

**Tujuan**: Verifikasi template bisa disimpan dan dimuat

**Langkah**:
1. Buka aplikasi
2. Klik "Template Baru"
3. Masukkan nama "Test Template"
4. Klik "Buat"
5. Atur pengaturan (GPS, waktu, cuaca, gaya)
6. Klik "Simpan Template"
7. Refresh halaman
8. Klik template di sidebar

**Expected Result**:
- Template tersimpan
- Pengaturan dimuat setelah refresh
- Semua nilai sesuai yang disimpan

---

### Test Case 3: Multiple Templates

**Tujuan**: Verifikasi bisa manage multiple template

**Langkah**:
1. Buat template 1: "Template A"
2. Buat template 2: "Template B"
3. Buat template 3: "Template C"
4. Klik template A
5. Ubah pengaturan
6. Klik template B
7. Verifikasi pengaturan berbeda
8. Klik template C
9. Verifikasi pengaturan berbeda

**Expected Result**:
- Semua template tersimpan
- Pengaturan berbeda untuk setiap template
- Bisa switch antar template

---

### Test Case 4: Geolocation

**Tujuan**: Verifikasi geolocation bekerja

**Langkah**:
1. Buka aplikasi
2. Klik "Ambil Lokasi Saat Ini"
3. Izinkan akses lokasi
4. Tunggu hasil

**Expected Result**:
- Latitude dan longitude terisi
- Format: -6.2088, 106.8456
- Koordinat akurat dengan lokasi device

---

### Test Case 5: Weather API

**Tujuan**: Verifikasi weather API bekerja

**Langkah**:
1. Buka aplikasi
2. Masukkan kota: "Jakarta"
3. Klik "Ambil Cuaca Saat Ini"
4. Tunggu hasil

**Expected Result**:
- Data cuaca ditampilkan
- Format: "☀️ Cerah 28°C"
- Suhu dan kondisi akurat

---

### Test Case 6: Image Formats

**Tujuan**: Verifikasi berbagai format gambar

**Langkah**:
1. Upload gambar JPG → Expected: Berhasil
2. Upload gambar PNG → Expected: Berhasil
3. Upload gambar WebP → Expected: Berhasil
4. Upload gambar BMP → Expected: Error/Tidak support

**Expected Result**:
- JPG, PNG, WebP diterima
- Format lain ditolak atau error

---

### Test Case 7: Watermark Positioning

**Tujuan**: Verifikasi posisi watermark

**Langkah**:
1. Upload gambar
2. Aktifkan watermark
3. Pilih posisi "Bawah Kiri"
4. Lihat preview
5. Ubah ke "Bawah Kanan"
6. Lihat preview
7. Ubah ke "Atas Kiri"
8. Lihat preview
9. Ubah ke "Atas Kanan"
10. Lihat preview

**Expected Result**:
- Watermark muncul di posisi yang benar
- Tidak menutupi gambar penting

---

### Test Case 8: Font Size

**Tujuan**: Verifikasi font size berfungsi

**Langkah**:
1. Upload gambar
2. Aktifkan watermark
3. Set font size 8px
4. Lihat preview (sangat kecil)
5. Set font size 48px
6. Lihat preview (sangat besar)
7. Set font size 16px
8. Lihat preview (normal)

**Expected Result**:
- Font size berubah sesuai slider
- Preview update real-time

---

### Test Case 9: Color Customization

**Tujuan**: Verifikasi warna bisa dikustomisasi

**Langkah**:
1. Upload gambar
2. Aktifkan watermark
3. Ubah warna teks ke merah
4. Ubah warna background ke biru
5. Lihat preview

**Expected Result**:
- Warna teks berubah
- Warna background berubah
- Preview update real-time

---

### Test Case 10: Download Quality

**Tujuan**: Verifikasi kualitas file download

**Langkah**:
1. Upload gambar
2. Aktifkan watermark
3. Download gambar
4. Buka file yang diunduh
5. Verifikasi watermark terlihat jelas

**Expected Result**:
- File PNG berkualitas tinggi
- Watermark terlihat jelas
- Tidak ada distorsi

---

## Browser Testing

### Chrome
- [ ] Aplikasi buka
- [ ] Semua fitur bekerja
- [ ] Geolocation bekerja
- [ ] Download bekerja
- [ ] IndexedDB bekerja

### Firefox
- [ ] Aplikasi buka
- [ ] Semua fitur bekerja
- [ ] Geolocation bekerja
- [ ] Download bekerja
- [ ] IndexedDB bekerja

### Safari
- [ ] Aplikasi buka
- [ ] Semua fitur bekerja
- [ ] Geolocation bekerja
- [ ] Download bekerja
- [ ] IndexedDB bekerja

### Edge
- [ ] Aplikasi buka
- [ ] Semua fitur bekerja
- [ ] Geolocation bekerja
- [ ] Download bekerja
- [ ] IndexedDB bekerja

---

## Performance Testing

### Load Time
- [ ] Aplikasi load < 2 detik
- [ ] Preview update < 500ms
- [ ] Download < 1 detik

### Memory Usage
- [ ] Tidak ada memory leak
- [ ] Memory stabil saat idle
- [ ] Memory release setelah reset

### File Size
- [ ] Total code < 50KB
- [ ] Gambar download < 5MB
- [ ] Database < 10MB

---

## Edge Cases

### Test Case: Gambar Sangat Besar
- Upload gambar 4000x3000px
- Expected: Bisa diproses (mungkin lambat)

### Test Case: Gambar Sangat Kecil
- Upload gambar 100x100px
- Expected: Watermark terlihat (mungkin besar)

### Test Case: Kota Tidak Ditemukan
- Masukkan kota: "XYZ123"
- Expected: Error message

### Test Case: Offline Mode
- Matikan internet
- Coba ambil cuaca
- Expected: Error message

### Test Case: Private Mode
- Buka di private/incognito
- Simpan template
- Tutup private mode
- Buka private mode lagi
- Expected: Template hilang (normal)

---

## Regression Testing

Setelah update, test:
- [ ] Semua fitur masih bekerja
- [ ] Tidak ada fitur yang rusak
- [ ] Performance tidak menurun
- [ ] Database masih kompatibel

---

## User Acceptance Testing (UAT)

Minta user untuk:
1. Buka aplikasi
2. Upload gambar
3. Buat template
4. Download gambar
5. Feedback

**Kriteria Sukses**:
- User bisa menyelesaikan task
- User tidak bingung
- Hasil sesuai ekspektasi

---

## Bug Report Template

```
Title: [Deskripsi singkat bug]

Environment:
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/Mac/Linux]
- Version: [Versi browser]

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Result:
...

Actual Result:
...

Screenshots:
[Attach screenshot]

Console Error:
[Paste error dari DevTools]
```

---

Selamat testing! 🧪
