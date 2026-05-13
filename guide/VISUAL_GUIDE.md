# 🎨 Visual Guide - Mobile First & Warna Kuning

## 📱 Mobile Layout (< 768px)

```
┌─────────────────────────────┐
│  📸 Image Watermark         │
│  GPS • Waktu • Cuaca        │
└─────────────────────────────┘

┌─────────────────────────────┐
│ [Upload] [Pengaturan]       │  ← Tabs
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │ 📁 Klik atau drag   │    │
│  │ JPG, PNG, WebP      │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │   Preview Canvas    │    │
│  │   (Gambar)          │    │
│  └─────────────────────┘    │
│                             │
│  [⬇️ Download] [🔄 Reset]   │
│                             │
├─────────────────────────────┤
│ 📋 Template                 │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │Temp1 │ │Temp2 │ │Temp3 │ │
│ └──────┘ └──────┘ └──────┘ │
│ [+ Baru]                    │
└─────────────────────────────┘
```

---

## 💻 Desktop Layout (768px+)

```
┌──────────────────────────────────────────────┐
│  📸 Image Watermark Pro                      │
│  Tambahkan GPS, Waktu & Cuaca pada Gambar   │
└──────────────────────────────────────────────┘

┌──────────┬──────────────────────────────────┐
│          │ [Upload] [Pengaturan]            │
│ 📋       ├──────────────────────────────────┤
│ Template │ ┌──────────────────────────────┐ │
│          │ │ 📁 Klik atau drag gambar    │ │
│ ┌──────┐ │ │ Format: JPG, PNG, WebP      │ │
│ │Temp1 │ │ └──────────────────────────────┘ │
│ └──────┘ │                                  │
│          │ ┌──────────────────┐ ┌────────┐ │
│ ┌──────┐ │ │  Preview Canvas  │ │Download│ │
│ │Temp2 │ │ │  (Gambar)        │ │ Reset  │ │
│ └──────┘ │ └──────────────────┘ └────────┘ │
│          │                                  │
│ ┌──────┐ │                                  │
│ │Temp3 │ │                                  │
│ └──────┘ │                                  │
│          │                                  │
│ [+ Baru] │                                  │
└──────────┴──────────────────────────────────┘
```

---

## 🎨 Warna Palet

### Kuning (Primary)
```
┌─────────────────────────────┐
│ #FFC107 - Kuning Cerah      │  ← Main Color
│ Digunakan untuk: Buttons, Links, Highlights
└─────────────────────────────┘

┌─────────────────────────────┐
│ #FFA000 - Kuning Gelap      │  ← Hover State
│ Digunakan untuk: Button hover, Active state
└─────────────────────────────┘

┌─────────────────────────────┐
│ #FFF9E6 - Kuning Muda       │  ← Background
│ Digunakan untuk: Upload area, Light backgrounds
└─────────────────────────────┘
```

### Warna Lainnya
```
┌─────────────────────────────┐
│ #27ae60 - Hijau (Success)   │
│ Digunakan untuk: Download button
└─────────────────────────────┘

┌─────────────────────────────┐
│ #e74c3c - Merah (Danger)    │
│ Digunakan untuk: Delete button
└─────────────────────────────┘

┌─────────────────────────────┐
│ #95a5a6 - Abu-abu (Secondary)
│ Digunakan untuk: Secondary buttons, Text
└─────────────────────────────┘

┌─────────────────────────────┐
│ #2c3e50 - Gelap (Dark)      │
│ Digunakan untuk: Text, Headers
└─────────────────────────────┘
```

---

## 🎯 Button Styles

### Primary Button (Kuning)
```
Normal State:
┌──────────────────┐
│ 💾 Simpan        │  ← #FFC107 (Kuning)
│ Text: #333       │
└──────────────────┘

Hover State:
┌──────────────────┐
│ 💾 Simpan        │  ← #FFA000 (Kuning Gelap)
│ Text: #333       │
│ Shadow: Kuning   │
└──────────────────┘

Disabled State:
┌──────────────────┐
│ 💾 Simpan        │  ← Opacity 50%
│ Text: #333       │
└──────────────────┘
```

### Success Button (Hijau)
```
Normal State:
┌──────────────────┐
│ ⬇️ Download      │  ← #27ae60 (Hijau)
│ Text: White      │
└──────────────────┘

Hover State:
┌──────────────────┐
│ ⬇️ Download      │  ← #229954 (Hijau Gelap)
│ Text: White      │
│ Shadow: Hijau    │
└──────────────────┘
```

### Danger Button (Merah)
```
Normal State:
┌──────────────────┐
│ 🗑️ Hapus         │  ← #e74c3c (Merah)
│ Text: White      │
└──────────────────┘

Hover State:
┌──────────────────┐
│ 🗑️ Hapus         │  ← #c0392b (Merah Gelap)
│ Text: White      │
│ Shadow: Merah    │
└──────────────────┘
```

---

## 📐 Spacing & Sizing

### Mobile (< 768px)
```
Container Padding: 10px
┌─────────────────────────────┐
│ 10px                        │
│ ┌─────────────────────────┐ │
│ │ Content                 │ │
│ │ Padding: 15px           │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ Element             │ │ │
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
│ 10px                        │
└─────────────────────────────┘

Button Height: 44px (touch-friendly)
Button Padding: 12px 20px
Gap Between Elements: 10px
```

### Desktop (768px+)
```
Container Padding: 20px
┌──────────────────────────────────┐
│ 20px                             │
│ ┌────────────────────────────────┐│
│ │ Content                        ││
│ │ Padding: 30px                  ││
│ │ ┌──────────────────────────────┐││
│ │ │ Element                      │││
│ │ └──────────────────────────────┘││
│ └────────────────────────────────┘│
│ 20px                             │
└──────────────────────────────────┘

Button Height: 44px
Button Padding: 12px 20px
Gap Between Elements: 20px
```

---

## 📱 Responsive Breakpoints

```
Mobile First Approach:
┌─────────────────────────────────────┐
│ Default (Mobile)                    │
│ < 768px                             │
│ - Single column layout              │
│ - Stacked elements                  │
│ - Smaller padding                   │
│ - Smaller fonts                     │
└─────────────────────────────────────┘
         ↓ (768px+)
┌─────────────────────────────────────┐
│ Tablet & Desktop                    │
│ ≥ 768px                             │
│ - Multi-column layout               │
│ - Side-by-side elements             │
│ - Larger padding                    │
│ - Larger fonts                      │
└─────────────────────────────────────┘
```

---

## 🎨 Template Item Styles

### Normal State
```
┌──────────────────┐
│ Template Name    │  ← White background
│ Border: Gray     │
└──────────────────┘
```

### Hover State
```
┌──────────────────┐
│ Template Name    │  ← Light gray background
│ Border: Kuning   │
└──────────────────┘
```

### Active State
```
┌──────────────────┐
│ Template Name    │  ← Kuning background
│ Text: Gelap      │  ← Dark text
│ Border: Kuning   │
│ Font: Bold       │
└──────────────────┘
```

---

## 📊 Form Layout

### Mobile (Single Column)
```
┌─────────────────────────────┐
│ Nama Template               │
│ ┌─────────────────────────┐ │
│ │ Input field             │ │
│ └─────────────────────────┘ │
│                             │
│ 📍 GPS                      │
│ ☑ Tampilkan GPS             │
│ ┌─────────────────────────┐ │
│ │ Latitude                │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Longitude               │ │
│ └─────────────────────────┘ │
│ [📍 Ambil Lokasi]           │
│                             │
│ 🕐 Waktu                    │
│ ☑ Tampilkan Waktu           │
│ ┌─────────────────────────┐ │
│ │ Format Waktu            │ │
│ └─────────────────────────┘ │
│                             │
│ [💾 Simpan] [🗑️ Hapus]     │
└─────────────────────────────┘
```

### Desktop (Two Columns)
```
┌──────────────────────────────────────┐
│ Nama Template                        │
│ ┌──────────────────────────────────┐ │
│ │ Input field                      │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────┐ ┌──────────────┐   │
│ │ 📍 GPS       │ │ 🕐 Waktu     │   │
│ │ ☑ Tampilkan  │ │ ☑ Tampilkan  │   │
│ │ ┌──────────┐ │ │ ┌──────────┐ │   │
│ │ │Latitude  │ │ │ │Format    │ │   │
│ │ └──────────┘ │ │ └──────────┘ │   │
│ │ ┌──────────┐ │ │              │   │
│ │ │Longitude │ │ │              │   │
│ │ └──────────┘ │ │              │   │
│ │ [Ambil]      │ │              │   │
│ └──────────────┘ └──────────────┘   │
│                                      │
│ [💾 Simpan] [🗑️ Hapus]              │
└──────────────────────────────────────┘
```

---

## 🎯 Upload Area

```
┌─────────────────────────────┐
│ 📁 Klik atau drag gambar    │  ← Kuning muda background
│ JPG, PNG, WebP              │  ← Kuning border
│                             │
│ (Dashed border)             │
└─────────────────────────────┘

Hover State:
┌─────────────────────────────┐
│ 📁 Klik atau drag gambar    │  ← Lebih terang
│ JPG, PNG, WebP              │  ← Kuning gelap border
│                             │
│ (Dashed border)             │
└─────────────────────────────┘

Dragover State:
┌─────────────────────────────┐
│ 📁 Klik atau drag gambar    │  ← Lebih terang
│ JPG, PNG, WebP              │  ← Kuning gelap border
│                             │  ← Scaled up
│ (Dashed border)             │
└─────────────────────────────┘
```

---

## 📊 Preview Section

### Mobile
```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │   Preview Canvas        │ │
│ │   (Gambar dengan        │ │
│ │    watermark)           │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ [⬇️ Download] [🔄 Reset]   │
└─────────────────────────────┘
```

### Desktop
```
┌──────────────────────────────────────┐
│ ┌──────────────────────┐ ┌────────┐  │
│ │                      │ │Download│  │
│ │   Preview Canvas     │ │        │  │
│ │   (Gambar dengan     │ │ Reset  │  │
│ │    watermark)        │ │        │  │
│ │                      │ │        │  │
│ └──────────────────────┘ └────────┘  │
└──────────────────────────────────────┘
```

---

## 🎨 Color Combinations

### Recommended Combinations
```
✅ Putih Text + Kuning Background
┌─────────────────────────────┐
│ Teks Putih                  │  ← #FFFFFF
│ Background: #FFC107         │
└─────────────────────────────┘

✅ Gelap Text + Kuning Background
┌─────────────────────────────┐
│ Teks Gelap                  │  ← #333333
│ Background: #FFC107         │
└─────────────────────────────┘

✅ Putih Text + Hitam Background
┌─────────────────────────────┐
│ Teks Putih                  │  ← #FFFFFF
│ Background: #000000         │
└─────────────────────────────┘
```

---

## 📱 Mobile vs Desktop Comparison

```
MOBILE                          DESKTOP
┌─────────────────────┐        ┌──────────────────────────────┐
│ Header (1.8em)      │        │ Header (2.5em)               │
├─────────────────────┤        ├──────────┬───────────────────┤
│ Main Content        │        │ Sidebar  │ Main Content     │
│ - Upload            │        │ (250px)  │ - Upload         │
│ - Preview           │        │          │ - Preview        │
│ - Settings          │        │          │ - Settings       │
├─────────────────────┤        │          │                  │
│ Sidebar             │        │          │                  │
│ - Templates         │        │          │                  │
│ - New Button        │        │          │                  │
└─────────────────────┘        └──────────┴───────────────────┘

Padding: 10px                  Padding: 20px
Content: 15px                  Content: 30px
Form: 1 Column                 Form: 2 Columns
Templates: Grid                Templates: Single Column
```

---

## 🎯 Key Visual Changes

### Before (Desktop-First)
- 🔵 Warna Biru
- 📊 Desktop layout default
- 📱 Mobile sebagai afterthought
- 🎨 Gradient Ungu

### After (Mobile-First)
- 🟡 Warna Kuning
- 📱 Mobile layout default
- 💻 Desktop sebagai enhancement
- 🎨 Gradient Kuning
- ✨ Lebih cerah dan energik

---

## 🎉 Visual Summary

Aplikasi sekarang memiliki:
- ✅ Warna kuning yang cerah dan energik
- ✅ Mobile-first responsive design
- ✅ Optimal spacing dan padding
- ✅ Touch-friendly buttons
- ✅ Modern dan professional look
- ✅ Better visual hierarchy
- ✅ Improved user experience

**Nikmati tampilan baru yang lebih baik!** 🎨✨

---

**Visual Guide Version**: 1.0  
**Last Updated**: 13 Mei 2026  
**Status**: ✅ Complete
