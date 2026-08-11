<?php
$css_v = filemtime(__DIR__ . '/styles.css');
$olc_v = filemtime(__DIR__ . '/openlocationcode.js');
$db_v  = filemtime(__DIR__ . '/db.js');
$wx_v  = filemtime(__DIR__ . '/weather.js');
$wm_v  = filemtime(__DIR__ . '/watermark.js');
$app_v = filemtime(__DIR__ . '/app.js');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>GPS Watermark - Tambahkan Lokasi, Waktu &amp; Cuaca pada Foto</title>
    <meta name="description" content="Aplikasi web gratis untuk menambahkan watermark GPS, waktu, dan cuaca pada foto. Lengkap dengan thumbnail peta, template tersimpan, dan export/import.">
    <meta name="author" content="Habibubebo">
    <meta name="theme-color" content="#FFC107">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="shortcut icon" href="favicon.svg">
    <link rel="apple-touch-icon" href="icon-192.png">
    <link rel="manifest" href="manifest.json">

    <!-- Leaflet Map Library -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css">
    <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>

    <!-- Open Graph -->
    <meta property="og:type"        content="website">
    <meta property="og:title"       content="GPS Watermark - Lokasi, Waktu & Cuaca pada Foto">
    <meta property="og:description" content="Tambahkan watermark GPS, waktu, dan cuaca pada foto Anda. Lengkap dengan thumbnail peta OpenStreetMap, template tersimpan, dan bisa export/import antar device.">
    <meta property="og:image"       content="og-image.png">
    <meta property="og:image:alt"   content="GPS Watermark app preview">
    <meta property="og:image:width"  content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale"      content="id_ID">

    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image">
    <meta name="twitter:title"       content="GPS Watermark - Lokasi, Waktu & Cuaca pada Foto">
    <meta name="twitter:description" content="Tambahkan watermark GPS, waktu, dan cuaca pada foto Anda. Gratis, tanpa login, semua data tersimpan lokal.">
    <meta name="twitter:image"       content="og-image.png">
    <meta name="twitter:image:alt"   content="GPS Watermark app preview">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Terapkan tema sebelum CSS dimuat untuk mencegah flash -->
    <script>
        (function () {
            try {
                var saved = localStorage.getItem('gpswm-theme');
                var theme = (saved === 'light' || saved === 'dark')
                    ? saved
                    : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {}
        })();
    </script>
    <link rel="stylesheet" href="styles.css?v=<?php echo $css_v; ?>">
</head>
<body>
    <div class="container">
        <header class="app-header">
            <div class="brand">
                <span class="brand-mark" aria-hidden="true"><i class="fas fa-camera"></i></span>
                <div class="brand-text">
                    <h1>GPS Watermark</h1>
                    <p>Tambahkan lokasi, waktu &amp; cuaca pada foto</p>
                </div>
            </div>
            <button class="theme-toggle" id="themeToggle" type="button" aria-label="Ganti tema terang atau gelap" title="Ganti tema">
                <i class="fas fa-moon theme-icon theme-icon-moon" aria-hidden="true"></i>
                <i class="fas fa-sun theme-icon theme-icon-sun" aria-hidden="true"></i>
            </button>
        </header>

        <div class="main-content">

            <!-- ── Main ── -->
            <main class="content">
                <div class="tabs">
                    <button class="tab-btn active" data-tab="upload"><i class="fas fa-image"></i> Foto</button>
                    <button class="tab-btn" data-tab="settings"><i class="fas fa-gear"></i> Pengaturan</button>
                </div>

                <!-- Tab: Upload & Preview -->
                <div class="tab-content active" id="upload-tab">
                    <div class="upload-area" id="uploadArea" role="button" tabindex="0" aria-label="Pilih foto untuk diberi watermark">
                        <input type="file" id="imageInput" accept="image/*" hidden>
                        <div class="upload-placeholder">
                            <div class="upload-icon" aria-hidden="true"><i class="fas fa-folder-open"></i></div>
                            <p>Ketuk atau drag foto ke sini</p>
                            <small>JPG &middot; PNG &middot; WebP</small>
                        </div>
                    </div>

                    <!-- Kontrol Watermark -->
                    <div class="wm-controls" id="wmControls">
                        <div class="wm-control-row">
                            <label>
                                <span class="ctrl-icon"><i class="fas fa-search"></i></span> Zoom
                                <span class="ctrl-val" id="zoomVal">100%</span>
                            </label>
                            <input type="range" id="wmZoom" min="30" max="200" value="100" step="5">
                        </div>
                        <div class="wm-control-row">
                            <label>
                                <span class="ctrl-icon"><i class="fas fa-font"></i></span> Teks
                                <span class="ctrl-val" id="textScaleVal">100%</span>
                            </label>
                            <input type="range" id="wmTextScale" min="40" max="250" value="100" step="5">
                        </div>
                    </div>

                    <div class="preview-wrap">
                        <canvas id="previewCanvas"></canvas>
                        <div id="noImagePlaceholder" class="no-image">
                            <span class="no-image-icon" aria-hidden="true"><i class="fas fa-images"></i></span>
                            <p>Belum ada foto</p>
                            <small>Upload gambar untuk melihat hasil watermark</small>
                        </div>
                    </div>

                    <div class="action-bar">
                        <button class="btn btn-success" id="downloadBtn" disabled><i class="fas fa-download"></i> Download</button>
                        <button class="btn btn-secondary" id="resetBtn" disabled><i class="fas fa-rotate"></i> Reset</button>
                    </div>
                </div>

                <!-- Tab: Settings -->
                <div class="tab-content" id="settings-tab">
                    <div class="settings-form">

                        <div class="form-group">
                            <label>Nama Template</label>
                            <input type="text" id="templateName" placeholder="Contoh: Liburan Bali">
                        </div>

                        <!-- GPS -->
                        <fieldset>
                            <legend><i class="fas fa-location-dot"></i> Lokasi GPS</legend>
                            <label class="toggle-row">
                                <input type="checkbox" id="enableGPS" checked>
                                <span>Tampilkan lokasi & peta</span>
                            </label>

                            <!-- Pin Icon Style -->
                            <div class="form-group">
                                <label>Gaya Pin</label>
                                <select id="pinStyle" class="select-inline">
                                    <option value="teardrop">📍 Teardrop (Default)</option>
                                    <option value="circle">🔴 Lingkaran</option>
                                    <option value="square">🟩 Kotak</option>
                                    <option value="star">⭐ Bintang</option>
                                </select>
                            </div>

                            <!-- Pin Color -->
                            <div class="form-group">
                                <label>Warna Pin</label>
                                <div class="color-picker-row">
                                    <input type="color" id="pinColor" value="#E53935">
                                    <div class="color-presets">
                                        <button type="button" class="color-preset" data-color="#E53935" style="background-color: #E53935;" title="Merah"></button>
                                        <button type="button" class="color-preset" data-color="#1976D2" style="background-color: #1976D2;" title="Biru"></button>
                                        <button type="button" class="color-preset" data-color="#388E3C" style="background-color: #388E3C;" title="Hijau"></button>
                                        <button type="button" class="color-preset" data-color="#F57C00" style="background-color: #F57C00;" title="Oranye"></button>
                                        <button type="button" class="color-preset" data-color="#7B1FA2" style="background-color: #7B1FA2;" title="Ungu"></button>
                                        <button type="button" class="color-preset" data-color="#000000" style="background-color: #000000;" title="Hitam"></button>
                                    </div>
                                </div>
                            </div>

                            <!-- Search by Address -->
                            <div class="search-row-wrap">
                                <div class="search-row">
                                    <input type="text" id="addressSearch" placeholder="Cari nama tempat atau alamat..." autocomplete="off">
                                    <button class="btn btn-outline" id="searchAddressBtn"><i class="fas fa-search"></i> Cari</button>
                                </div>
                                <div class="search-suggest" id="searchSuggest"></div>
                            </div>

                            <!-- Map Preview -->
                            <div class="map-wrapper">
                                <div id="mapContainer" class="map-container"></div>
                                <button class="btn btn-primary btn-map-center" id="centerMapBtn" type="button" title="Pusatkan peta ke pin"><i class="fas fa-crosshairs"></i></button>
                            </div>

                            <!-- Koordinat Manual -->
                            <div class="coord-row">
                                <div class="form-group">
                                    <label>Latitude</label>
                                    <input type="text" id="latitude" placeholder="-8.0586">
                                </div>
                                <div class="form-group">
                                    <label>Longitude</label>
                                    <input type="text" id="longitude" placeholder="112.0638">
                                </div>
                            </div>

                            <div class="source-toggle">
                                <button class="btn btn-outline" id="getLocationBtn"><i class="fas fa-location-dot"></i> Ambil Otomatis</button>
                                <button class="btn btn-outline-muted" id="toggleManualAddr" type="button"><i class="fas fa-pen"></i> Isi Manual</button>
                            </div>

                            <!-- Input alamat manual (tersembunyi by default) -->
                            <div id="manualAddrWrap" class="manual-wrap" style="display:none;">
                                <div class="form-group">
                                    <label>Alamat</label>
                                    <input type="text" id="manualAddress" placeholder="Jl. Cempaka, Srengat II, Kec. Srengat, Kabupaten Blitar, Jawa Timur">
                                </div>
                            </div>

                            <div id="addressInfo" class="info-badge"></div>
                        </fieldset>

                        <!-- Waktu -->
                        <fieldset>
                            <legend><i class="fas fa-clock"></i> Waktu</legend>
                            <label class="toggle-row">
                                <input type="checkbox" id="enableTime" checked>
                                <span>Tampilkan waktu</span>
                            </label>

                            <div class="source-toggle">
                                <select id="timeFormat" class="select-inline">
                                    <option value="full">Otomatis — Lengkap</option>
                                    <option value="date">Otomatis — Tanggal saja</option>
                                    <option value="time">Otomatis — Waktu saja</option>
                                    <option value="manual">✏️ Isi Manual</option>
                                </select>
                            </div>

                            <!-- Input waktu manual -->
                            <div id="manualTimeWrap" class="manual-wrap" style="display:none;">
                                <div class="form-group">
                                    <label>Tanggal</label>
                                    <input type="date" id="manualDate">
                                </div>
                                <div class="time-hms-row">
                                    <div class="form-group">
                                        <label>Jam</label>
                                        <input type="number" id="manualHour" min="0" max="23" placeholder="14">
                                    </div>
                                    <span class="time-sep">:</span>
                                    <div class="form-group">
                                        <label>Menit</label>
                                        <input type="number" id="manualMinute" min="0" max="59" placeholder="30">
                                    </div>
                                    <span class="time-sep">:</span>
                                    <div class="form-group">
                                        <label>Detik</label>
                                        <input type="number" id="manualSecond" min="0" max="59" placeholder="00">
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <!-- Cuaca -->
                        <fieldset>
                            <legend><i class="fas fa-cloud-sun"></i> Cuaca</legend>
                            <label class="toggle-row">
                                <input type="checkbox" id="enableWeather" checked>
                                <span>Tampilkan cuaca</span>
                            </label>

                            <div class="source-toggle">
                                <div class="form-group" style="flex:1;">
                                    <label>Kota</label>
                                    <input type="text" id="weatherCity" placeholder="Jakarta">
                                </div>
                                <button class="btn btn-outline" id="getWeatherBtn" style="align-self:flex-end;"><i class="fas fa-cloud-sun"></i> Ambil</button>
                                <button class="btn btn-outline-muted" id="toggleManualWeather" type="button" style="align-self:flex-end;"><i class="fas fa-pen"></i> Manual</button>
                            </div>

                            <!-- Input cuaca manual -->
                            <div id="manualWeatherWrap" class="manual-wrap" style="display:none;">
                                <div class="weather-manual-grid">
                                    <div class="form-group">
                                        <label><i class="fas fa-temperature-half"></i> Suhu (°C)</label>
                                        <input type="number" id="manualTemp" placeholder="28.77" step="0.01">
                                    </div>
                                    <div class="form-group">
                                        <label><i class="fas fa-wind"></i> Angin (m/s)</label>
                                        <input type="number" id="manualWind" placeholder="1.63" step="0.01">
                                    </div>
                                    <div class="form-group">
                                        <label><i class="fas fa-droplet"></i> Kelembaban (%)</label>
                                        <input type="number" id="manualHumidity" placeholder="87" min="0" max="100">
                                    </div>
                                    <div class="form-group">
                                        <label><i class="fas fa-cloud"></i> Kondisi</label>
                                        <select id="manualWeatherCode">
                                            <option value="0">☀️ Cerah</option>
                                            <option value="1">🌤️ Sebagian Berawan</option>
                                            <option value="2">⛅ Berawan</option>
                                            <option value="3">☁️ Mendung</option>
                                            <option value="45">🌫️ Berkabut</option>
                                            <option value="51">🌦️ Gerimis Ringan</option>
                                            <option value="61">🌧️ Hujan Ringan</option>
                                            <option value="63">🌧️ Hujan Sedang</option>
                                            <option value="65">🌧️ Hujan Lebat</option>
                                            <option value="80">🌧️ Hujan Lokal</option>
                                            <option value="95">⛈️ Badai</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div id="weatherInfo" class="info-badge"></div>
                        </fieldset>

                        <div class="form-actions">
                            <button class="btn btn-primary" id="saveTemplateBtn"><i class="fas fa-floppy-disk"></i> Simpan Template</button>
                            <button class="btn btn-danger" id="deleteTemplateBtn" style="display:none;"><i class="fas fa-trash-can"></i> Hapus</button>
                        </div>
                    </div>
                </div>
            </main>

            <!-- ── Sidebar Template ── -->
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h3><i class="fas fa-clipboard-list"></i> Template</h3>
                    <button class="btn btn-primary btn-sm" id="newTemplateBtn">+ Baru</button>
                </div>
                <div class="template-list" id="templateList"></div>
                <div class="template-empty" id="templateEmpty">
                    <p>Belum ada template</p>
                    <button class="btn btn-outline btn-sm" id="loadKantorBtn"><i class="fas fa-building"></i> Muat Template Kantor</button>
                </div>
                <div class="sidebar-actions">
                    <button class="btn btn-outline-muted btn-sm" id="exportBtn"><i class="fas fa-upload"></i> Export</button>
                    <label class="btn btn-outline-muted btn-sm" id="importLabel">
                        <i class="fas fa-download"></i> Import
                        <input type="file" id="importInput" accept=".json" hidden>
                    </label>
                </div>

            </aside>

        </div><!-- /.main-content -->
    </div><!-- /.container -->

    <!-- Modal: Template Baru -->
    <div class="modal" id="newTemplateModal" role="dialog" aria-modal="true" aria-labelledby="newTemplateTitle">
        <div class="modal-content">
            <h2 id="newTemplateTitle">Template Baru</h2>
            <input type="text" id="newTemplateName" placeholder="Nama template...">
            <div class="modal-actions">
                <button class="btn btn-primary" id="confirmNewTemplate" type="button">Buat</button>
                <button class="btn btn-secondary" id="cancelNewTemplate" type="button">Batal</button>
            </div>
        </div>
    </div>

    <!-- Modal: Konfirmasi Import -->
    <div class="modal" id="importModal" role="dialog" aria-modal="true" aria-labelledby="importTitle">
        <div class="modal-content">
            <h2 id="importTitle"><i class="fas fa-download"></i> Import Template</h2>
            <p class="modal-desc">
                Ditemukan <strong id="importModalCount">0</strong> template dalam file.<br>
                Pilih cara import:
            </p>
            <div class="import-options">
                <button class="btn btn-primary" id="importMergeBtn" type="button">
                    <i class="fas fa-plus"></i> Gabung
                    <small>Tambahkan ke template yang sudah ada</small>
                </button>
                <button class="btn btn-danger" id="importReplaceBtn" type="button">
                    <i class="fas fa-rotate"></i> Ganti Semua
                    <small>Hapus template lama, ganti dengan yang baru</small>
                </button>
            </div>
            <button class="btn btn-secondary" id="importCancelBtn" type="button" style="margin-top:10px;width:100%;">Batal</button>
        </div>
    </div>

    <!-- Open Location Code (Plus Code) Library -->
    <script src="openlocationcode.js?v=<?php echo $olc_v; ?>"></script>
    
    <script src="https://cdn.jsdelivr.net/npm/piexifjs@1.0.6/piexif.min.js"></script>
    <script src="db.js?v=<?php echo $db_v; ?>"></script>
    <script src="offline-handler.js"></script>
    <script src="weather.js?v=<?php echo $wx_v; ?>"></script>
    <script src="watermark.js?v=<?php echo $wm_v; ?>"></script>
    <script src="app.js?v=<?php echo $app_v; ?>"></script>

    <!-- PWA Install Toast -->
    <div class="pwa-toast" id="pwaToast">
        <div class="pwa-toast-inner">
            <i class="fas fa-download"></i>
            <div class="pwa-toast-text">
                <strong>Install GPS Watermark</strong>
                <span>Tambahkan ke home screen untuk akses cepat</span>
            </div>
            <button class="btn btn-primary btn-sm" id="pwaInstallBtn">Install</button>
            <button class="pwa-toast-close" id="pwaDismissBtn" type="button"><i class="fas fa-times"></i></button>
        </div>
    </div>

    <script>
    // PWA Install Prompt & Offline Detection
    (function() {
        let deferredPrompt = null;
        const toast = document.getElementById('pwaToast');
        const installBtn = document.getElementById('pwaInstallBtn');
        const dismissBtn = document.getElementById('pwaDismissBtn');

        // Enhanced Service Worker Registration with offline tracking
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration);
                    
                    // Check for updates periodically (every 30 minutes)
                    setInterval(() => {
                        registration.update();
                    }, 30 * 60 * 1000);
                    
                    // Listen for controller changes
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        console.log('New Service Worker activated');
                    });
                    
                    // Check for new version and prompt user
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('New update available (silent install)');
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.warn('Service Worker registration failed:', error);
                });
        }

        // Capture beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // Only show on mobile-like viewports
            if (window.innerWidth <= 768) {
                toast.classList.add('show');
            }
        });

        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            toast.classList.remove('show');
        });

        dismissBtn.addEventListener('click', () => {
            toast.classList.remove('show');
        });

        // Hide after app is installed
        window.addEventListener('appinstalled', () => {
            toast.classList.remove('show');
            deferredPrompt = null;
        });
        
        // Handle page visibility for offline detection
        document.addEventListener('visibilitychange', () => {
            if (document.hidden === false) {
                // Page became visible, check connection silently
                fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
                    .then(r => {
                        if (!r.ok) {
                            console.log('Server error, using cache');
                        }
                    })
                    .catch(() => {
                        console.log('Still offline or server down, using cache');
                    });
            }
        });
        
        // Handle page load errors gracefully — show cached version
        window.addEventListener('error', (event) => {
            // Suppress error notifications, let offline handler manage it
            if (event.message && event.message.includes('Failed to fetch')) {
                event.preventDefault();
            }
        }, true);
    })();

    // Aksesibilitas: Escape menutup modal & Enter/Space membuka file picker
    (function() {
        const modals = ['newTemplateModal', 'importModal'];

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            modals.forEach((id) => {
                const m = document.getElementById(id);
                if (m && m.classList.contains('active')) {
                    m.classList.remove('active');
                }
            });
        });

        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        if (uploadArea && imageInput) {
            uploadArea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    imageInput.click();
                }
            });
        }
    })();

    // Tema terang/gelap (toggle di pojok kanan atas)
    (function() {
        const root = document.documentElement;
        const btn = document.getElementById('themeToggle');
        if (!btn) return;

        const meta = document.querySelector('meta[name="theme-color"]');
        const apply = (theme) => {
            root.setAttribute('data-theme', theme);
            try { localStorage.setItem('gpswm-theme', theme); } catch (e) {}
            if (meta) meta.setAttribute('content', theme === 'dark' ? '#151412' : '#FFC107');
        };

        btn.addEventListener('click', () => {
            const cur = root.getAttribute('data-theme');
            apply(cur === 'dark' ? 'light' : 'dark');
        });

        // Ikuti perubahan tema sistem selama belum pernah toggle manual
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('gpswm-theme')) return;
            apply(e.matches ? 'dark' : 'light');
        });
    })();
    </script>
</body>
</html>
