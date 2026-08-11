/**
 * Offline Handler — Menangani kegagalan API saat server tidak merespon
 * Memastikan aplikasi tetap berfungsi dengan data cache atau fallback
 * SILENT MODE — Tidak menampilkan notifikasi error, hanya info penting
 */

class OfflineHandler {
    constructor() {
        this.isOnline = navigator.onLine;
        this.hasShownOfflineNotice = false;
        this._db = null;
        this._dbReady = this._initDB();
        this.setupListeners();
    }

    async _initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('WatermarkDB', 3);

            request.onupgradeneeded = (e) => {
                // Gunakan skema terpusat dari db.js agar semua store
                // (templates & apiCache) selalu dibuat oleh siapa pun
                // yang membuka database lebih dulu.
                if (typeof upgradeWatermarkDB === 'function') {
                    upgradeWatermarkDB(e.target.result);
                } else {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('apiCache')) {
                        db.createObjectStore('apiCache');
                    }
                }
            };

            request.onsuccess = (e) => {
                this._db = e.target.result;
                resolve(this._db);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async _getDB() {
        if (this._db) return this._db;
        return this._dbReady;
    }

    setupListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            // Subtle notification when coming back online
            this.showNotification('✓ Kembali online', 'success', 2000);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            // Show offline notice hanya sekali
            if (!this.hasShownOfflineNotice) {
                this.showNotification('Aplikasi akan bekerja tanpa koneksi internet', 'info', 3000);
                this.hasShownOfflineNotice = true;
            }
        });
    }

    /**
     * Fetch dengan fallback dan retry logic
     */
    async fetchWithRetry(url, options = {}, retries = 2) {
        const timeout = options.timeout || 8000;
        let timeoutId;
        
        try {
            const controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);
            
            if (retries > 0 && (error.name === 'AbortError' || !this.isOnline)) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.fetchWithRetry(url, options, retries - 1);
            }
            
            throw error;
        }
    }

    /**
     * Get data dari IndexedDB cache sebelum mengambil dari API
     * Silent operation — tidak menampilkan pesan error
     */
    async fetchWithCache(key, fetchFn, ttl = 3600000) { // default 1 jam
        try {
            const cached = await this.getCacheData(key);
            
            if (cached && Date.now() - cached.timestamp < ttl) {
                return cached.data;
            }

            // Try fetching fresh data
            const data = await fetchFn();
            
            // Cache hasil
            await this.setCacheData(key, data);
            return data;
        } catch (error) {
            // Jika fetch gagal, return cached data walau expired
            const cached = await this.getCacheData(key);
            if (cached) {
                console.warn(`Using stale cache for ${key}:`, cached.data);
                return cached.data;
            }
            
            throw new Error(`Tidak bisa mendapatkan data untuk ${key} dan cache kosong`);
        }
    }

    /**
     * IndexedDB operations
     */
    async getCacheData(key) {
        try {
            const db = await this._getDB();
            if (!db.objectStoreNames.contains('apiCache')) return null;

            return new Promise((resolve, reject) => {
                const tx = db.transaction('apiCache', 'readonly');
                const store = tx.objectStore('apiCache');
                const result = store.get(key);
                result.onsuccess = () => resolve(result.result);
                result.onerror = () => reject(result.error);
            });
        } catch {
            return null;
        }
    }

    async setCacheData(key, data) {
        try {
            const db = await this._getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('apiCache', 'readwrite');
                const store = tx.objectStore('apiCache');
                store.put({ timestamp: Date.now(), data }, key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch {
            // Silent fail
        }
    }

    /**
     * Tampilkan notifikasi HANYA untuk info penting
     * Error atau offline tidak ditampilkan (silent mode)
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notif = document.createElement('div');
        notif.className = `offline-notification offline-${type}`;
        notif.innerHTML = `<i class="fas fa-${
            type === 'success' ? 'check-circle' : 
            type === 'warning' ? 'exclamation-triangle' : 
            'info-circle'
        }"></i> ${message}`;
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, duration);
    }

    /**
     * Silent error handling — log only, tidak notify user
     */
    handleError(error, context = '') {
        console.warn(`[${context}] Error (silent):`, error.message);
        // Don't show error to user, application continues normally
    }

    /**
     * Check jika request ke API gagal karena server tidak merespon
     */
    isServerOffline(error) {
        return error.message.includes('Failed to fetch') ||
               error.name === 'AbortError' ||
               error.message.includes('timeout') ||
               !navigator.onLine;
    }
}

// Global instance
const offlineHandler = new OfflineHandler();
