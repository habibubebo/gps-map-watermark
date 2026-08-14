// Watermark Manager
class WatermarkManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
    }

    // Load gambar dari file
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.originalImage = img;
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    this.ctx.drawImage(img, 0, 0);
                    resolve(img);
                };
                img.onerror = () => reject(new Error('Gagal memuat gambar'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Gagal membaca file'));
            reader.readAsDataURL(file);
        });
    }

    // Load thumbnail peta - 3×3 tiles, crop agar koordinat tepat di tengah
    loadMapThumbnail(lat, lng) {
        return new Promise((resolve) => {
            const ZOOM     = 16;
            const TILE_PX  = 256;
            const OUT_SIZE = 256; // ukuran output thumbnail

            // Konversi lat/lng → posisi piksel global pada zoom level ini
            const n        = Math.pow(2, ZOOM);
            const tileXf   = (lng + 180) / 360 * n;                                                          // float tile X
            const latRad   = lat * Math.PI / 180;
            const tileYf   = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;     // float tile Y

            // Tile integer tengah
            const tileX0   = Math.floor(tileXf);
            const tileY0   = Math.floor(tileYf);

            // Offset piksel koordinat di dalam tile tengah (0-255)
            const offX     = (tileXf - tileX0) * TILE_PX;  // piksel dari kiri tile tengah
            const offY     = (tileYf - tileY0) * TILE_PX;  // piksel dari atas tile tengah

            // Kita ambil grid 3×3 tile (baris -1..+1, kolom -1..+1)
            // Posisi koordinat dalam kanvas 3×3 (768×768):
            const coordX   = TILE_PX + offX;   // piksel X koordinat di kanvas 3×3
            const coordY   = TILE_PX + offY;   // piksel Y koordinat di kanvas 3×3

            // Crop: ambil OUT_SIZE×OUT_SIZE dengan koordinat di tengah
            const cropX    = Math.round(coordX - OUT_SIZE / 2);
            const cropY    = Math.round(coordY - OUT_SIZE / 2);

            // Buat offscreen canvas 3×3 tiles
            const offCanvas = document.createElement('canvas');
            offCanvas.width  = TILE_PX * 3;
            offCanvas.height = TILE_PX * 3;
            const offCtx    = offCanvas.getContext('2d');

            let loaded = 0;
            let failed = 0;
            const total = 9;

            const tryResolve = () => {
                if (loaded + failed < total) return;
                if (failed === total) { resolve(null); return; }

                // Crop ke OUT_SIZE×OUT_SIZE dengan koordinat di tengah
                const result = document.createElement('canvas');
                result.width  = OUT_SIZE;
                result.height = OUT_SIZE;
                const rCtx = result.getContext('2d');
                rCtx.drawImage(offCanvas, cropX, cropY, OUT_SIZE, OUT_SIZE, 0, 0, OUT_SIZE, OUT_SIZE);
                resolve(result);
            };

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const tx  = ((tileX0 + dx) % n + n) % n;   // wrap antimeridian
                    const ty  = tileY0 + dy;
                    const url = `https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`;

                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        offCtx.drawImage(img, (dx + 1) * TILE_PX, (dy + 1) * TILE_PX);
                        loaded++;
                        tryResolve();
                    };
                    img.onerror = () => { failed++; tryResolve(); };
                    img.src = url;
                }
            }
        });
    }

    // Gambar watermark utama (style referensi)
    async drawWatermark(settings) {
        if (!this.originalImage) return;

        // Reset canvas ke gambar asli
        this.ctx.drawImage(this.originalImage, 0, 0);

        const W = this.canvas.width;
        const H = this.canvas.height;

        // zoom: 0.5 - 2.0 (default 1.0), textScale: 0.5 - 2.0 (default 1.0)
        const zoom      = settings.zoom      != null ? settings.zoom      : 1.0;
        const textScale = settings.textScale != null ? settings.textScale : 1.0;

        // Skala relatif terhadap lebar gambar × zoom
        const scale = (W / 1080) * zoom;
        const mapSize   = Math.round(110 * scale);
        const padding   = Math.round(14 * scale);
        const margin    = Math.round(16 * scale);
        const barW      = Math.round(4 * scale);
        const fontSize1 = Math.round(22 * scale * textScale); // alamat
        const fontSize2 = Math.round(20 * scale * textScale); // koordinat & cuaca
        const lineH     = Math.round(28 * scale * textScale);

        // Kumpulkan baris teks
        const lines = [];

        if (settings.enableGPS && settings.address) {
            // Pecah alamat jadi maks 2 baris
            const addrLines = this.wrapText(settings.address, fontSize1, W - mapSize - barW - padding * 4 - margin * 2);
            addrLines.slice(0, 2).forEach(l => lines.push({ text: l, size: fontSize1, bold: false }));
        }

        // Tampilkan Plus Code jika tersedia
        if (settings.enableGPS && settings.plusCode) {
            lines.push({ text: `🗺️ ${settings.plusCode}`, size: fontSize2, bold: true });
        }

        if (settings.enableGPS && settings.latitude && settings.longitude) {
            const lat = parseFloat(settings.latitude).toFixed(4);
            const lng = parseFloat(settings.longitude).toFixed(4);
            lines.push({ text: `Lat: ${lat}°, Long: ${lng}°`, size: fontSize2, bold: false });
        }

        if (settings.enableTime) {
            lines.push({ text: this.formatTime(settings.timeFormat, settings.manualDatetime), size: fontSize2, bold: false });
        }

        if (settings.enableWeather && settings.weatherObj) {
            const w = settings.weatherObj;
            const icon = this.weatherIcon(w.weatherCode);
            lines.push({
                text: `${icon} ${w.temperature}°C  💨 ${w.windSpeed}m/s  💧 ${w.humidity}%`,
                size: fontSize2,
                bold: false
            });
        }

        if (lines.length === 0 && !settings.enableGPS) return;

        // Hitung tinggi kotak
        const textBlockH = lines.length * lineH + padding;
        const boxH = Math.max(mapSize + padding * 2, textBlockH + padding * 2);

        // Posisi kotak (selalu bottom-left seperti referensi)
        const boxX = margin;
        const boxY = H - boxH - margin;
        const boxW = mapSize + barW + padding * 3 + this.maxTextWidth(lines, W - mapSize - barW - padding * 4 - margin * 2);

        // Background hitam semi-transparan
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
        this.roundRect(boxX, boxY, boxW, boxH, Math.round(10 * scale));
        this.ctx.fill();

        // Thumbnail peta
        if (settings.enableGPS && settings.latitude && settings.longitude) {
            const mapImg = await this.loadMapThumbnail(
                parseFloat(settings.latitude),
                parseFloat(settings.longitude)
            );
            const mapX = boxX + padding;
            const mapY = boxY + (boxH - mapSize) / 2;

            if (mapImg) {
                // Clip rounded rect untuk peta
                this.ctx.save();
                this.ctx.beginPath();
                this.roundRect(mapX, mapY, mapSize, mapSize, Math.round(6 * scale));
                this.ctx.clip();
                // mapImg adalah canvas 256×256 - scale ke mapSize×mapSize
                this.ctx.drawImage(mapImg, 0, 0, 256, 256, mapX, mapY, mapSize, mapSize);
                this.ctx.restore();

                // Pin merah - koordinat selalu tepat di tengah thumbnail
                const pinCX = mapX + mapSize / 2;
                const pinCY = mapY + mapSize / 2;
                this.drawPin(pinCX, pinCY, scale, settings.pinStyle, settings.pinColor);
            } else {
                // Fallback: kotak abu-abu dengan teks
                this.ctx.fillStyle = '#333';
                this.roundRect(mapX, mapY, mapSize, mapSize, Math.round(6 * scale));
                this.ctx.fill();
                this.ctx.fillStyle = '#aaa';
                this.ctx.font = `${Math.round(11 * scale)}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Map', mapX + mapSize / 2, mapY + mapSize / 2);
                this.ctx.textAlign = 'left';
            }
        }

        // Garis kuning vertikal
        const barX = boxX + padding + mapSize + padding;
        this.ctx.fillStyle = '#FFC107';
        this.ctx.fillRect(barX, boxY + padding, barW, boxH - padding * 2);

        // Teks info
        const textX = barX + barW + padding;
        let textY = boxY + padding + lineH * 0.85;

        lines.forEach((line) => {
            this.ctx.font = `${line.bold ? 'bold ' : ''}${line.size}px Arial, sans-serif`;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.textBaseline = 'alphabetic';
            this.ctx.fillText(line.text, textX, textY);
            textY += lineH;
        });
    }

    // Gambar pin lokasi - teardrop, ujung bawah = titik koordinat
    drawPin(cx, cy, scale, pinStyle = 'teardrop', pinColor = '#E53935') {
        const r  = Math.round(9 * scale);   // radius lingkaran kepala pin
        
        this.ctx.save();

        // Shadow
        this.ctx.shadowColor   = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur    = Math.round(4 * scale);
        this.ctx.shadowOffsetY = Math.round(2 * scale);

        if (pinStyle === 'teardrop') {
            // Teardrop shape (default)
            const tx = cx;                       // ujung bawah (titik koordinat)
            const ty = cy + r * 1.8;            // ujung bawah teardrop

            // Body teardrop
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, Math.PI * 0.15, Math.PI * 0.85, false); // busur bawah
            this.ctx.lineTo(tx, ty);                                          // ujung lancip
            this.ctx.closePath();
            this.ctx.fillStyle = pinColor;
            this.ctx.fill();

            // Kepala lingkaran penuh
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.fillStyle = pinColor;
            this.ctx.fill();
        } else if (pinStyle === 'circle') {
            // Circle shape
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.fillStyle = pinColor;
            this.ctx.fill();
        } else if (pinStyle === 'square') {
            // Square shape
            const size = r * 1.6;
            this.ctx.fillStyle = pinColor;
            this.ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        } else if (pinStyle === 'star') {
            // Star shape
            this.drawStar(cx, cy, 5, r, r * 0.5, pinColor);
        }

        this.ctx.shadowColor = 'transparent';

        // Border putih
        if (pinStyle === 'circle' || pinStyle === 'teardrop') {
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth   = Math.max(1.5, Math.round(2 * scale));
            this.ctx.stroke();
        } else if (pinStyle === 'square') {
            const size = r * 1.6;
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth   = Math.max(1.5, Math.round(2 * scale));
            this.ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
        } else if (pinStyle === 'star') {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth   = Math.max(1.5, Math.round(2 * scale));
            this.ctx.stroke();
        }

        // Titik putih di tengah
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, Math.max(2, Math.round(3.5 * scale)), 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();

        this.ctx.restore();
    }

    // Helper: draw star shape
    drawStar(cx, cy, points, outerRadius, innerRadius, fillColor = '#E53935') {
        let angle = Math.PI / 2;
        const angleSlice = Math.PI / points;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = cx + Math.cos(angle) * radius;
            const y = cy - Math.sin(angle) * radius;
            this.ctx.lineTo(x, y);
            angle += angleSlice;
        }

        this.ctx.closePath();
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
    }

    // Rounded rect path helper
    roundRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
    }

    // Wrap teks agar tidak melebihi maxWidth
    wrapText(text, fontSize, maxWidth) {
        this.ctx.font = `${fontSize}px Arial, sans-serif`;
        const words = text.split(' ');
        const lines = [];
        let current = '';
        for (const word of words) {
            const test = current ? current + ' ' + word : word;
            if (this.ctx.measureText(test).width > maxWidth && current) {
                lines.push(current);
                current = word;
            } else {
                current = test;
            }
        }
        if (current) lines.push(current);
        return lines;
    }

    // Hitung lebar teks terpanjang
    maxTextWidth(lines, fallback) {
        let max = fallback;
        lines.forEach(l => {
            this.ctx.font = `${l.size}px Arial, sans-serif`;
            const w = this.ctx.measureText(l.text).width;
            if (w > max) max = w;
        });
        return max;
    }

    // Icon cuaca sederhana (unicode)
    weatherIcon(code) {
        if (code === 0) return '☀️';
        if (code <= 2) return '🌤️';
        if (code === 3) return '☁️';
        if (code <= 48) return '🌫️';
        if (code <= 67) return '🌧️';
        if (code <= 77) return '❄️';
        if (code <= 82) return '🌧️';
        if (code <= 86) return '❄️';
        return '⛈️';
    }

    // Format waktu - mendukung manual datetime
    formatTime(format, manualDatetime = null) {
        const now = manualDatetime instanceof Date && !isNaN(manualDatetime)
            ? manualDatetime
            : new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const H = String(now.getHours()).padStart(2, '0');
        const M = String(now.getMinutes()).padStart(2, '0');
        const S = String(now.getSeconds()).padStart(2, '0');
        switch (format) {
            case 'date':   return `${d}/${m}/${y}`;
            case 'time':   return `${H}:${M}:${S}`;
            case 'manual': return `${d}/${m}/${y} ${H}:${M}:${S}`;
            default:       return `${d}/${m}/${y} ${H}:${M}:${S}`;
        }
    }

    // Download gambar dengan EXIF
    downloadImage(filename, settings = {}) {
        let jpegData = this.canvas.toDataURL('image/jpeg', 0.92);
        if (typeof piexif !== 'undefined' && settings) {
            jpegData = this.insertExif(jpegData, settings);
        }
        const binary = atob(jpegData.split(',')[1]);
        const data = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
        const blob = new Blob([data], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    insertExif(jpegData, settings) {
        const zeroth = {};
        const exif = {};
        const gps = {};

        const ts = settings.exifDatetime || new Date().toISOString().replace(/[T\-]/g, ':').replace(/:\d{2}\..*/, '');

        zeroth[piexif.ImageIFD.DateTime] = ts;
        zeroth[piexif.ImageIFD.Software] = 'GPS Watermark';
        exif[piexif.ExifIFD.DateTimeOriginal] = ts;
        exif[piexif.ExifIFD.DateTimeDigitized] = ts;

        if (settings.enableGPS && settings.latitude && settings.longitude) {
            const lat = parseFloat(settings.latitude);
            const lng = parseFloat(settings.longitude);
            gps[piexif.GPSIFD.GPSVersionID] = [2, 3, 0, 0];
            gps[piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
            gps[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(Math.abs(lat));
            gps[piexif.GPSIFD.GPSLongitudeRef] = lng < 0 ? 'W' : 'E';
            gps[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(Math.abs(lng));
            gps[piexif.GPSIFD.GPSDateStamp] = ts;
        }

        const exifObj = {};
        if (Object.keys(zeroth).length) exifObj['0th'] = zeroth;
        if (Object.keys(exif).length) exifObj['Exif'] = exif;
        if (Object.keys(gps).length) exifObj['GPS'] = gps;

        const exifBytes = piexif.dump(exifObj);
        return piexif.insert(exifBytes, jpegData);
    }

    // Reset canvas
    reset() {
        this.originalImage = null;
        this.canvas.width = 0;
        this.canvas.height = 0;
    }
}

const watermark = new WatermarkManager('previewCanvas');
