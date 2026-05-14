// Main Application
class WatermarkApp {
    constructor() {
        this.currentTemplate = null;
        this.currentImage    = null;
        this.weatherObj      = null;  // objek cuaca (auto atau manual)
        this.address         = '';    // alamat (auto atau manual)
        this.manualAddr      = false; // mode alamat manual aktif
        this.manualWeather   = false; // mode cuaca manual aktif
        this.map             = null;  // Leaflet map instance
        this.mapMarker       = null;  // Leaflet marker
        this.addressUpdateTimeout = null; // debounce timeout untuk update alamat
        this.init();
    }

    async init() {
        await db.init();
        this.setupEventListeners();
        await this.loadTemplates();
        const templates = await db.getAllTemplates();
        if (templates.length > 0) await this.selectTemplate(templates[0].id, null);
    }

    // ── Event Listeners ──────────────────────────────────────
    setupEventListeners() {
        // Upload
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault(); uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) this.handleImageUpload(e.dataTransfer.files[0]);
        });
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) this.handleImageUpload(e.target.files[0]);
        });

        // Action buttons
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetImage());
        document.getElementById('saveTemplateBtn').addEventListener('click', () => this.saveTemplate());
        document.getElementById('deleteTemplateBtn').addEventListener('click', () => this.deleteTemplate());
        document.getElementById('newTemplateBtn').addEventListener('click', () => this.showNewTemplateModal());
        document.getElementById('confirmNewTemplate').addEventListener('click', () => this.confirmNewTemplate());
        document.getElementById('cancelNewTemplate').addEventListener('click', () => this.closeNewTemplateModal());

        // Export / Import
        document.getElementById('exportBtn').addEventListener('click', () => this.exportTemplates());
        document.getElementById('importInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) this.importTemplates(e.target.files[0]);
        });

        // Load Kantor template suggestion
        document.getElementById('loadKantorBtn').addEventListener('click', () => this.loadKantorTemplate());

        // GPS
        document.getElementById('getLocationBtn').addEventListener('click', () => this.getLocation());
        document.getElementById('toggleManualAddr').addEventListener('click', () => this.toggleManualAddr());
        document.getElementById('searchAddressBtn').addEventListener('click', () => this.searchAddress());
        document.getElementById('addressSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchAddress();
        });
        document.getElementById('pinStyle').addEventListener('change', () => this.updatePreview());
        document.getElementById('pinColor').addEventListener('input', () => this.updatePreview());
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                document.getElementById('pinColor').value = color;
                this.updatePreview();
            });
        });

        // Waktu
        document.getElementById('timeFormat').addEventListener('change', (e) => {
            const isManual = e.target.value === 'manual';
            document.getElementById('manualTimeWrap').style.display = isManual ? 'block' : 'none';
            this.updatePreview();
        });
        ['manualDate','manualHour','manualMinute','manualSecond'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updatePreview());
        });

        // Cuaca
        document.getElementById('getWeatherBtn').addEventListener('click', () => this.getWeatherByCity());
        document.getElementById('toggleManualWeather').addEventListener('click', () => this.toggleManualWeather());

        // Manual cuaca inputs — live preview
        ['manualTemp','manualWind','manualHumidity','manualWeatherCode'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                if (this.manualWeather) {
                    this.weatherObj = this.buildManualWeather();
                    this.showWeatherBadge(this.weatherObj);
                    this.updatePreview();
                }
            });
        });

        // Manual alamat input — live preview
        document.getElementById('manualAddress').addEventListener('input', () => {
            if (this.manualAddr) {
                this.address = this.buildManualAddress();
                document.getElementById('addressInfo').textContent = this.address;
                this.updatePreview();
            }
        });

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab, e.target));
        });

        // Live preview — checkboxes & selects
        ['enableGPS','enableTime','enableWeather'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updatePreview());
        });
        ['latitude','longitude'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updatePreview();
                this.updateAddressFromCoordinates();
            });
        });

        // Zoom & text scale sliders
        document.getElementById('wmZoom').addEventListener('input', (e) => {
            document.getElementById('zoomVal').textContent = e.target.value + '%';
            this.updatePreview();
        });
        document.getElementById('wmTextScale').addEventListener('input', (e) => {
            document.getElementById('textScaleVal').textContent = e.target.value + '%';
            this.updatePreview();
        });

        // Refresh
        // (dihapus — preview sudah realtime)
    }

    // ── Toggle manual alamat ─────────────────────────────────
    toggleManualAddr() {
        this.manualAddr = !this.manualAddr;
        const wrap = document.getElementById('manualAddrWrap');
        const btn  = document.getElementById('toggleManualAddr');
        wrap.style.display = this.manualAddr ? 'block' : 'none';
        btn.textContent    = this.manualAddr ? '✖ Tutup Manual' : '✏️ Isi Manual';
        btn.classList.toggle('btn-outline-active', this.manualAddr);

        if (!this.manualAddr) {
            this.address = document.getElementById('addressInfo').dataset.auto || '';
        } else {
            document.getElementById('manualAddress').value = this.address;
        }
        this.updatePreview();
    }

    buildManualAddress() {
        return document.getElementById('manualAddress').value.trim();
    }

    // ── Toggle manual cuaca ──────────────────────────────────
    toggleManualWeather() {
        this.manualWeather = !this.manualWeather;
        const wrap = document.getElementById('manualWeatherWrap');
        const btn  = document.getElementById('toggleManualWeather');
        wrap.style.display = this.manualWeather ? 'block' : 'none';
        btn.textContent    = this.manualWeather ? '✖ Tutup Manual' : '✏️ Manual';
        btn.classList.toggle('btn-outline-active', this.manualWeather);

        if (this.manualWeather) {
            // Pre-fill dari data cuaca yang sudah ada
            if (this.weatherObj) {
                document.getElementById('manualTemp').value        = this.weatherObj.temperature;
                document.getElementById('manualWind').value        = this.weatherObj.windSpeed;
                document.getElementById('manualHumidity').value    = this.weatherObj.humidity;
                document.getElementById('manualWeatherCode').value = this.weatherObj.weatherCode ?? 0;
            }
            this.weatherObj = this.buildManualWeather();
            this.showWeatherBadge(this.weatherObj);
        }
        this.updatePreview();
    }

    buildManualWeather() {
        const code = parseInt(document.getElementById('manualWeatherCode').value) || 0;
        return {
            temperature:  document.getElementById('manualTemp').value     || '0',
            windSpeed:    document.getElementById('manualWind').value      || '0',
            humidity:     document.getElementById('manualHumidity').value  || '0',
            weatherCode:  code,
            description:  document.getElementById('manualWeatherCode').selectedOptions[0]?.text.replace(/^.{2}\s*/,'') || '',
        };
    }

    // ── Upload ───────────────────────────────────────────────
    async handleImageUpload(file) {
        try {
            this.currentImage = file;
            await watermark.loadImage(file);
            document.getElementById('noImagePlaceholder').style.display = 'none';
            document.getElementById('downloadBtn').disabled = false;
            document.getElementById('resetBtn').disabled   = false;
            document.getElementById('wmControls').classList.add('visible');
            this.updatePreview();
        } catch (err) {
            alert('Gagal memuat gambar: ' + err.message);
        }
    }

    // ── Preview ──────────────────────────────────────────────
    async updatePreview() {
        if (!this.currentImage) return;
        await watermark.drawWatermark(this.getFormSettings());
    }

    getFormSettings() {
        const timeFormat = document.getElementById('timeFormat').value;
        let manualDatetime = null;
        if (timeFormat === 'manual') {
            const dateVal = document.getElementById('manualDate').value;
            const H = parseInt(document.getElementById('manualHour').value)   || 0;
            const M = parseInt(document.getElementById('manualMinute').value) || 0;
            const S = parseInt(document.getElementById('manualSecond').value) || 0;
            if (dateVal) {
                const [y, mo, d] = dateVal.split('-').map(Number);
                manualDatetime = new Date(y, mo - 1, d, H, M, S);
            }
        }

        // Alamat: manual override atau auto
        const addr = this.manualAddr
            ? this.buildManualAddress()
            : this.address;

        return {
            enableGPS:      document.getElementById('enableGPS').checked,
            latitude:       document.getElementById('latitude').value,
            longitude:      document.getElementById('longitude').value,
            address:        addr,
            pinStyle:       document.getElementById('pinStyle').value,
            pinColor:       document.getElementById('pinColor').value,
            enableTime:     document.getElementById('enableTime').checked,
            timeFormat,
            manualDatetime,
            enableWeather:  document.getElementById('enableWeather').checked,
            weatherObj:     this.weatherObj,
            zoom:           parseInt(document.getElementById('wmZoom').value) / 100,
            textScale:      parseInt(document.getElementById('wmTextScale').value) / 100,
        };
    }

    // ── Refresh ──────────────────────────────────────────────
    // (dihapus — preview sudah realtime)

    // ── Download ─────────────────────────────────────────────
    downloadImage() {
        // Ambil waktu dari watermark (manual atau otomatis) — bukan realtime
        const timeFormat = document.getElementById('timeFormat').value;
        let ts;
        if (timeFormat === 'manual') {
            const dateVal = document.getElementById('manualDate').value;
            const H2 = parseInt(document.getElementById('manualHour').value)   || 0;
            const M2 = parseInt(document.getElementById('manualMinute').value) || 0;
            const S2 = parseInt(document.getElementById('manualSecond').value) || 0;
            if (dateVal) {
                const [y2, mo2, d2] = dateVal.split('-').map(Number);
                ts = new Date(y2, mo2 - 1, d2, H2, M2, S2);
            } else {
                ts = new Date();
            }
        } else {
            ts = new Date();
        }

        const d  = String(ts.getDate()).padStart(2, '0');
        const mo = String(ts.getMonth() + 1).padStart(2, '0');
        const y  = ts.getFullYear();
        const H  = String(ts.getHours()).padStart(2, '0');
        const M  = String(ts.getMinutes()).padStart(2, '0');
        const S  = String(ts.getSeconds()).padStart(2, '0');

        const filename = `gps-map-${d}${mo}${y}-${H}${M}${S}.jpg`;
        const exifDatetime = `${y}:${mo}:${d} ${H}:${M}:${S}`;
        watermark.downloadImage(filename, { ...this.getFormSettings(), exifDatetime });
    }

    // ── Reset ────────────────────────────────────────────────
    resetImage() {
        this.currentImage = null;
        watermark.reset();
        document.getElementById('noImagePlaceholder').style.display = 'block';
        document.getElementById('downloadBtn').disabled = true;
        document.getElementById('resetBtn').disabled   = true;
        document.getElementById('imageInput').value    = '';
        document.getElementById('wmControls').classList.remove('visible');
    }

    // ── GPS Otomatis ─────────────────────────────────────────
    getLocation() {
        if (!navigator.geolocation) { alert('Geolocation tidak didukung'); return; }
        const btn = document.getElementById('getLocationBtn');
        btn.disabled = true; btn.textContent = '⏳ Mengambil...';

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude.toFixed(4);
                const lng = pos.coords.longitude.toFixed(4);
                document.getElementById('latitude').value  = lat;
                document.getElementById('longitude').value = lng;
                btn.disabled = false; btn.textContent = '📍 Ambil Otomatis';

                document.getElementById('addressInfo').textContent = '⏳ Mengambil alamat...';
                try {
                    const addr = await weather.reverseGeocode(lat, lng);
                    this.address = addr || `${lat}, ${lng}`;
                } catch {
                    this.address = `${lat}, ${lng}`;
                }
                document.getElementById('addressInfo').textContent = this.address;
                document.getElementById('addressInfo').dataset.auto = this.address;

                try {
                    this.weatherObj = await weather.getWeatherByCoordinates(lat, lng);
                    this.showWeatherBadge(this.weatherObj);
                } catch { /* opsional */ }

                this.updatePreview();
            },
            (err) => {
                alert('Gagal mengambil lokasi: ' + err.message);
                btn.disabled = false; btn.textContent = '📍 Ambil Otomatis';
            }
        );
    }

    // ── Cuaca Otomatis by kota ───────────────────────────────
    async getWeatherByCity() {
        const city = document.getElementById('weatherCity').value.trim();
        if (!city) { alert('Masukkan nama kota'); return; }
        const btn = document.getElementById('getWeatherBtn');
        btn.disabled = true; btn.textContent = '⏳ Mengambil...';
        try {
            const data = await weather.getWeatherByCity(city);
            this.weatherObj    = data;
            this.manualWeather = false;
            document.getElementById('manualWeatherWrap').style.display = 'none';
            document.getElementById('toggleManualWeather').textContent = '✏️ Manual';
            document.getElementById('toggleManualWeather').classList.remove('btn-outline-active');

            if (!document.getElementById('latitude').value) {
                document.getElementById('latitude').value  = data.latitude.toFixed(4);
                document.getElementById('longitude').value = data.longitude.toFixed(4);
                try {
                    const addr = await weather.reverseGeocode(data.latitude, data.longitude);
                    this.address = addr || city;
                    document.getElementById('addressInfo').textContent = this.address;
                    document.getElementById('addressInfo').dataset.auto = this.address;
                } catch { this.address = city; }
            }
            this.showWeatherBadge(data);
            this.updatePreview();
        } catch (err) {
            alert('Gagal mengambil cuaca: ' + err.message);
        } finally {
            btn.disabled = false; btn.textContent = '🌤️ Ambil';
        }
    }

    showWeatherBadge(w) {
        if (!w) return;
        document.getElementById('weatherInfo').textContent =
            `${w.description}  ${w.temperature}°C  💨 ${w.windSpeed}m/s  💧 ${w.humidity}%`;
    }

    // ── Template ─────────────────────────────────────────────
    async loadTemplates() {
        const templates = await db.getAllTemplates();
        const list = document.getElementById('templateList');
        const empty = document.getElementById('templateEmpty');
        list.innerHTML = '';
        if (templates.length === 0) {
            empty.style.display = 'block';
            document.getElementById('deleteTemplateBtn').style.display = 'none';
            return;
        }
        empty.style.display = 'none';
        templates.forEach(t => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.dataset.id = t.id;
            item.textContent = t.name;
            item.addEventListener('click', (e) => this.selectTemplate(t.id, e.currentTarget));
            list.appendChild(item);
        });
    }

    async selectTemplate(id, el) {
        const t = await db.getTemplate(id);
        if (!t) return;
        this.currentTemplate = t;

        document.getElementById('templateName').value      = t.name;
        document.getElementById('enableGPS').checked       = t.enableGPS ?? true;
        document.getElementById('latitude').value          = t.latitude  || '';
        document.getElementById('longitude').value         = t.longitude || '';
        document.getElementById('pinStyle').value          = t.pinStyle  || 'teardrop';
        document.getElementById('pinColor').value          = t.pinColor  || '#E53935';
        document.getElementById('enableTime').checked      = t.enableTime ?? true;
        document.getElementById('timeFormat').value        = t.timeFormat || 'full';
        document.getElementById('enableWeather').checked   = t.enableWeather ?? true;
        document.getElementById('weatherCity').value       = t.weatherCity || '';
        document.getElementById('weatherInfo').textContent = t.weatherText || '';
        document.getElementById('addressInfo').textContent = t.address || '';
        document.getElementById('addressInfo').dataset.auto = t.address || '';

        this.address    = t.address    || '';
        this.weatherObj = t.weatherObj || null;

        // Manual alamat
        this.manualAddr = t.manualAddr || false;
        document.getElementById('manualAddrWrap').style.display = this.manualAddr ? 'block' : 'none';
        document.getElementById('toggleManualAddr').textContent = this.manualAddr ? '✖ Tutup Manual' : '✏️ Isi Manual';
        document.getElementById('toggleManualAddr').classList.toggle('btn-outline-active', this.manualAddr);
        document.getElementById('manualAddress').value = t.manualAddress || t.address || '';

        // Manual waktu
        const isManualTime = t.timeFormat === 'manual';
        document.getElementById('manualTimeWrap').style.display = isManualTime ? 'block' : 'none';
        document.getElementById('manualDate').value   = t.manualDate   || '';
        document.getElementById('manualHour').value   = t.manualHour   ?? '';
        document.getElementById('manualMinute').value = t.manualMinute ?? '';
        document.getElementById('manualSecond').value = t.manualSecond ?? '';

        // Manual cuaca
        this.manualWeather = t.manualWeather || false;
        document.getElementById('manualWeatherWrap').style.display = this.manualWeather ? 'block' : 'none';
        document.getElementById('toggleManualWeather').textContent = this.manualWeather ? '✖ Tutup Manual' : '✏️ Manual';
        document.getElementById('toggleManualWeather').classList.toggle('btn-outline-active', this.manualWeather);
        document.getElementById('manualTemp').value         = t.manualTemp     || '';
        document.getElementById('manualWind').value         = t.manualWind     || '';
        document.getElementById('manualHumidity').value     = t.manualHumidity || '';
        document.getElementById('manualWeatherCode').value  = t.manualWeatherCode ?? 0;

        // Zoom & text scale
        const zoom      = t.wmZoom      ?? 100;
        const textScale = t.wmTextScale ?? 100;
        document.getElementById('wmZoom').value              = zoom;
        document.getElementById('wmTextScale').value         = textScale;
        document.getElementById('zoomVal').textContent       = zoom + '%';
        document.getElementById('textScaleVal').textContent  = textScale + '%';

        document.querySelectorAll('.template-item').forEach(i => i.classList.remove('active'));
        if (el) el.classList.add('active');
        else {
            const found = document.querySelector(`.template-item[data-id="${id}"]`);
            if (found) found.classList.add('active');
        }
        document.getElementById('deleteTemplateBtn').style.display = 'inline-block';
        
        // Update map marker jika map sudah diinisialisasi
        if (this.map && t.latitude && t.longitude) {
            this.updateMapMarker(t.latitude, t.longitude);
        }
        
        this.updatePreview();
    }

    async saveTemplate() {
        const name = document.getElementById('templateName').value.trim();
        if (!name) { alert('Masukkan nama template'); return; }

        const data = {
            name,
            enableGPS:          document.getElementById('enableGPS').checked,
            latitude:           document.getElementById('latitude').value,
            longitude:          document.getElementById('longitude').value,
            address:            this.address,
            pinStyle:           document.getElementById('pinStyle').value,
            pinColor:           document.getElementById('pinColor').value,
            manualAddr:         this.manualAddr,
            manualAddress:      document.getElementById('manualAddress').value,
            enableTime:         document.getElementById('enableTime').checked,
            timeFormat:         document.getElementById('timeFormat').value,
            manualDate:         document.getElementById('manualDate').value,
            manualHour:         document.getElementById('manualHour').value,
            manualMinute:       document.getElementById('manualMinute').value,
            manualSecond:       document.getElementById('manualSecond').value,
            enableWeather:      document.getElementById('enableWeather').checked,
            weatherCity:        document.getElementById('weatherCity').value,
            weatherText:        document.getElementById('weatherInfo').textContent,
            weatherObj:         this.weatherObj,
            manualWeather:      this.manualWeather,
            manualTemp:         document.getElementById('manualTemp').value,
            manualWind:         document.getElementById('manualWind').value,
            manualHumidity:     document.getElementById('manualHumidity').value,
            manualWeatherCode:  document.getElementById('manualWeatherCode').value,
            wmZoom:             document.getElementById('wmZoom').value,
            wmTextScale:        document.getElementById('wmTextScale').value,
        };

        try {
            if (this.currentTemplate) {
                await db.updateTemplate(this.currentTemplate.id, data);
            } else {
                const newId = await db.saveTemplate(data);
                this.currentTemplate = { id: newId, ...data };
            }
            await this.loadTemplates();
            const el = document.querySelector(`.template-item[data-id="${this.currentTemplate.id}"]`);
            if (el) el.classList.add('active');
        } catch (err) { alert('Gagal menyimpan: ' + err.message); }
    }

    async deleteTemplate() {
        if (!this.currentTemplate) return;
        if (!confirm('Hapus template ini?')) return;
        await db.deleteTemplate(this.currentTemplate.id);
        this.currentTemplate = null;
        document.getElementById('deleteTemplateBtn').style.display = 'none';
        await this.loadTemplates();
    }

    showNewTemplateModal() {
        document.getElementById('newTemplateModal').classList.add('active');
        document.getElementById('newTemplateName').focus();
    }
    closeNewTemplateModal() {
        document.getElementById('newTemplateModal').classList.remove('active');
        document.getElementById('newTemplateName').value = '';
    }
    async confirmNewTemplate() {
        const name = document.getElementById('newTemplateName').value.trim();
        if (!name) { alert('Masukkan nama template'); return; }
        const def = {
            name, enableGPS: true, latitude: '', longitude: '', address: '', pinStyle: 'teardrop', pinColor: '#E53935',
            manualAddr: false, manualAddress: '',
            enableTime: true, timeFormat: 'full',
            manualDate: '', manualHour: '', manualMinute: '', manualSecond: '',
            enableWeather: true, weatherCity: '', weatherText: '', weatherObj: null,
            manualWeather: false, manualTemp: '', manualWind: '', manualHumidity: '', manualWeatherCode: 0,
            wmZoom: 100, wmTextScale: 100,
        };
        const newId = await db.saveTemplate(def);
        this.currentTemplate = { id: newId, ...def };
        await this.loadTemplates();
        this.closeNewTemplateModal();
        const el = document.querySelector(`.template-item[data-id="${newId}"]`);
        if (el) el.classList.add('active');
    }

    // ── Export semua template ke file JSON ───────────────────
    async exportTemplates() {
        const templates = await db.getAllTemplates();
        if (templates.length === 0) {
            alert('Belum ada template untuk di-export.'); return;
        }

        // Hapus field id agar saat import tidak bentrok dengan id lama
        const payload = {
            version: 1,
            exportedAt: new Date().toISOString(),
            templates: templates.map(({ id, ...rest }) => rest),
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const ts   = new Date().toISOString().slice(0, 10);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `gps-watermark-templates-${ts}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // ── Import template dari file JSON ───────────────────────
    async importTemplates(file) {
        // Reset input agar file yang sama bisa dipilih lagi
        document.getElementById('importInput').value = '';

        try {
            const text = await file.text();
            const payload = JSON.parse(text);

            // Validasi struktur
            if (!payload.templates || !Array.isArray(payload.templates)) {
                alert('File tidak valid — bukan file export GPS Watermark.'); return;
            }

            const mode = await this.showImportDialog(payload.templates.length);
            if (mode === 'cancel') return;

            // Hapus semua template lama jika mode replace
            if (mode === 'replace') {
                const existing = await db.getAllTemplates();
                for (const t of existing) await db.deleteTemplate(t.id);
            }

            // Simpan template dari file
            let count = 0;
            for (const t of payload.templates) {
                if (!t.name) continue; // skip entri tanpa nama
                await db.saveTemplate(t);
                count++;
            }

            await this.loadTemplates();
            alert(`✅ ${count} template berhasil di-import.`);
        } catch (err) {
            alert('Gagal membaca file: ' + err.message);
        }
    }

    // ── Load template Kantor (hardcode — hindari CORS) ─────
    async loadKantorTemplate() {
        const kantor = {
            name: "Kantor",
            enableGPS: true,
            latitude: "-8.0617",
            longitude: "111.9072",
            address: "Jalan Panglima Sudirman, Kedungwaru, Tulungagung, Jawa Timur",
            manualAddr: false,
            manualAddress: "",
            enableTime: true,
            timeFormat: "full",
            manualDate: "",
            manualHour: "",
            manualMinute: "",
            manualSecond: "",
            enableWeather: true,
            weatherCity: "Tulungagung",
            weatherText: "Gerimis Ringan  29.50°C  💨 10.70m/s  💧 75%",
            weatherObj: {
                temperature: "29.50",
                windSpeed: "10.70",
                humidity: 75,
                weatherCode: 51,
                description: "Gerimis Ringan",
                city: "Tulungagung",
                country: "Indonesia",
                latitude: -8.0657,
                longitude: 111.9025
            },
            manualWeather: false,
            manualTemp: "",
            manualWind: "",
            manualHumidity: "",
            manualWeatherCode: 0,
            wmZoom: 130,
            wmTextScale: 100,
        };
        try {
            const newId = await db.saveTemplate(kantor);
            await this.loadTemplates();
            await this.selectTemplate(newId, null);
        } catch (err) {
            alert('Gagal memuat template Kantor: ' + err.message);
        }
    }

    // Dialog pilihan import — returns 'merge' | 'replace' | 'cancel'
    showImportDialog(count) {
        return new Promise((resolve) => {
            const modal = document.getElementById('importModal');
            document.getElementById('importModalCount').textContent = count;
            modal.classList.add('active');

            const onMerge   = () => { cleanup(); resolve('merge'); };
            const onReplace = () => { cleanup(); resolve('replace'); };
            const onCancel  = () => { cleanup(); resolve('cancel'); };

            document.getElementById('importMergeBtn').addEventListener('click', onMerge,   { once: true });
            document.getElementById('importReplaceBtn').addEventListener('click', onReplace, { once: true });
            document.getElementById('importCancelBtn').addEventListener('click', onCancel,  { once: true });

            function cleanup() { modal.classList.remove('active'); }
        });
    }

    // ── Address Search ──────────────────────────────────────
    async searchAddress() {
        const query = document.getElementById('addressSearch').value.trim();
        if (!query) { alert('Masukkan nama tempat atau alamat'); return; }
        
        const btn = document.getElementById('searchAddressBtn');
        btn.disabled = true;
        btn.textContent = '⏳ Mencari...';
        
        try {
            const results = await this.geocodeAddress(query);
            if (results.length === 0) {
                alert('Lokasi tidak ditemukan');
                btn.disabled = false;
                btn.textContent = '🔍 Cari';
                return;
            }
            
            // Ambil hasil pertama
            const result = results[0];
            const lat = parseFloat(result.lat).toFixed(4);
            const lng = parseFloat(result.lon).toFixed(4);
            
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
            
            // Update map
            this.updateMapMarker(lat, lng);
            
            // Ambil alamat lengkap
            try {
                const addr = await weather.reverseGeocode(lat, lng);
                this.address = addr || result.display_name;
            } catch {
                this.address = result.display_name;
            }
            document.getElementById('addressInfo').textContent = this.address;
            document.getElementById('addressInfo').dataset.auto = this.address;
            
            // Ambil cuaca untuk lokasi ini
            try {
                this.weatherObj = await weather.getWeatherByCoordinates(lat, lng);
                this.showWeatherBadge(this.weatherObj);
            } catch { /* opsional */ }
            
            this.updatePreview();
        } catch (err) {
            alert('Gagal mencari lokasi: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = '🔍 Cari';
        }
    }

    // Geocode address using Nominatim API
    async geocodeAddress(query) {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=id`,
            { headers: { 'Accept-Language': 'id' } }
        );
        const data = await res.json();
        return data;
    }

    // ── Auto-update alamat dari koordinat ────────────────────
    async updateAddressFromCoordinates() {
        const lat = document.getElementById('latitude').value.trim();
        const lng = document.getElementById('longitude').value.trim();
        
        // Validasi koordinat
        if (!lat || !lng) return;
        
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        
        if (isNaN(latNum) || isNaN(lngNum)) return;
        
        // Jangan update jika sedang dalam mode manual alamat
        if (this.manualAddr) return;
        
        try {
            // Debounce: tunggu 500ms sebelum melakukan reverse geocode & fetch cuaca
            if (this.addressUpdateTimeout) clearTimeout(this.addressUpdateTimeout);
            
            this.addressUpdateTimeout = setTimeout(async () => {
                // Update alamat
                try {
                    const addr = await weather.reverseGeocode(latNum, lngNum);
                    if (addr) {
                        this.address = addr;
                        document.getElementById('addressInfo').textContent = addr;
                        document.getElementById('addressInfo').dataset.auto = addr;
                    }
                } catch (err) {
                    console.warn('Gagal update alamat:', err);
                }
                
                // Update cuaca (hanya jika tidak dalam mode manual cuaca)
                if (!this.manualWeather) {
                    try {
                        this.weatherObj = await weather.getWeatherByCoordinates(latNum, lngNum);
                        
                        // Extract kota dari alamat untuk weatherCity field
                        if (this.address) {
                            // Ambil bagian terakhir dari alamat (biasanya kota/kabupaten)
                            const parts = this.address.split(',');
                            const city = parts[parts.length - 2]?.trim() || parts[parts.length - 1]?.trim() || '';
                            document.getElementById('weatherCity').value = city;
                        }
                        
                        this.showWeatherBadge(this.weatherObj);
                        this.updatePreview();
                    } catch (err) {
                        console.warn('Gagal update cuaca:', err);
                    }
                }
            }, 500);
        } catch (err) {
            console.warn('Gagal update alamat/cuaca:', err);
        }
    }

    // ── Map Management ───────────────────────────────────────
    initMap() {
        const container = document.getElementById('mapContainer');
        if (!container || this.map) return;
        
        // Default center (Indonesia)
        const defaultLat = -8.0586;
        const defaultLng = 112.0638;
        
        this.map = L.map('mapContainer').setView([defaultLat, defaultLng], 13);
        
        // OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '',
            maxZoom: 19,
        }).addTo(this.map);
        
        // Custom marker icon (hanya emoji)
        const customIcon = L.divIcon({
            html: `<div style="font-size: 32px; line-height: 1; cursor: grab;">📍</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            className: 'custom-marker'
        });
        
        // Add marker
        this.mapMarker = L.marker([defaultLat, defaultLng], {
            draggable: true,
            icon: customIcon,
            title: 'Klik atau drag untuk memilih lokasi'
        }).addTo(this.map);
        
        // Handle marker drag
        this.mapMarker.on('dragend', () => {
            const pos = this.mapMarker.getLatLng();
            this.setCoordinates(pos.lat, pos.lng);
        });
        
        // Handle map click
        this.map.on('click', (e) => {
            this.mapMarker.setLatLng(e.latlng);
            this.setCoordinates(e.latlng.lat, e.latlng.lng);
        });
    }

    updateMapMarker(lat, lng) {
        if (!this.map) this.initMap();
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (!isNaN(latNum) && !isNaN(lngNum)) {
            this.mapMarker.setLatLng([latNum, lngNum]);
            this.map.setView([latNum, lngNum], 13);
        }
    }

    setCoordinates(lat, lng) {
        const latStr = parseFloat(lat).toFixed(4);
        const lngStr = parseFloat(lng).toFixed(4);
        document.getElementById('latitude').value = latStr;
        document.getElementById('longitude').value = lngStr;
        this.updateAddressFromCoordinates();
        this.updatePreview();
    }

    // ── Tab ──────────────────────────────────────────────────
    switchTab(tabName, btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Initialize map when settings tab is opened
        if (tabName === 'settings') {
            setTimeout(() => this.initMap(), 100);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => { new WatermarkApp(); });
