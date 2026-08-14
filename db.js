// ── Device ID Generator (berdasarkan User-Agent) ──────────────
function getDeviceId() {
  let deviceId = localStorage.getItem('gpswm_device_id');
  if (!deviceId) {
    const ua = navigator.userAgent || 'unknown';
    const random = Math.random().toString(36).slice(2, 10);
    const raw = ua + '-' + random;
    deviceId = btoa(encodeURIComponent(raw)).replace(/=+$/, '').slice(0, 40);
    localStorage.setItem('gpswm_device_id', deviceId);
  }
  return deviceId;
}

// ── Server Sync Manager ──────────────────────────────────────
function getServerUrl() {
  const scripts = document.getElementsByTagName('script');
  let base = '';
  for (const s of scripts) {
    if (s.src && s.src.includes('db.js')) {
      base = s.src.substring(0, s.src.lastIndexOf('/') + 1);
      break;
    }
  }
  if (!base) {
    const path = window.location.pathname;
    base = window.location.origin + path.substring(0, path.lastIndexOf('/') + 1);
  }
  return base + 'server.php';
}

class SyncManager {
  async api(payload) {
    const serverUrl = getServerUrl();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async checkHealth() {
    const res = await this.api({ action: 'health' });
    return res != null && res.status === 'ok';
  }

  async fetchTemplates(deviceId) {
    const data = await this.api({ action: 'get', deviceId, userAgent: navigator.userAgent });
    return (data != null && data.templates) || [];
  }

  async createTemplate(deviceId, templateData) {
    const data = await this.api({ action: 'create', deviceId, userAgent: navigator.userAgent, ...templateData });
    return (data != null && data.template) || null;
  }

  async updateTemplate(deviceId, serverId, templateData) {
    const data = await this.api({ action: 'update', deviceId, serverId, userAgent: navigator.userAgent, ...templateData });
    return data != null && data.success === true;
  }

  async deleteTemplate(deviceId, serverId) {
    const data = await this.api({ action: 'delete', deviceId, serverId, userAgent: navigator.userAgent });
    return data != null && data.success === true;
  }

  async deleteAllTemplates(deviceId) {
    const data = await this.api({ action: 'deleteAll', deviceId, userAgent: navigator.userAgent });
    return data != null && data.success === true;
  }
}

const syncManager = new SyncManager();

// ── Skema database terpusat (dipakai db.js & offline-handler.js) ──
// Penting: BUKAN hanya di satu file - siapa pun yang membuka DB lebih dulu
// akan menjalankan upgrade-nya. Pastikan semua store dibuat di sini.
function upgradeWatermarkDB(db) {
    if (!db.objectStoreNames.contains('templates')) {
        const templateStore = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
        templateStore.createIndex('name', 'name', { unique: false });
        templateStore.createIndex('createdAt', 'createdAt', { unique: false });
    }
    if (!db.objectStoreNames.contains('apiCache')) {
        db.createObjectStore('apiCache');
    }
}

// ── Database Manager ─────────────────────────────────────────
class DatabaseManager {
    constructor() {
        this.dbName = 'WatermarkDB';
        this.version = 3;
        this.db = null;
    }

    // Inisialisasi database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                upgradeWatermarkDB(event.target.result);
            };
        });
    }

    // Simpan template baru
    async saveTemplate(templateData) {
        const deviceId = getDeviceId();

        // Simpan ke server dulu (dapat serverId)
        const serverResult = await syncManager.createTemplate(deviceId, templateData);

        const data = {
            ...templateData,
            serverId: (serverResult != null && serverResult.serverId) || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('Template saved:', request.result);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error saving template');
                reject(request.error);
            };
        });
    }

    // Update template
    async updateTemplate(id, templateData) {
        const deviceId = getDeviceId();

        // Ambil template lama untuk dapat serverId
        const existing = await this.getTemplate(id);

        // Sync ke server
        if (existing != null && existing.serverId) {
            await syncManager.updateTemplate(deviceId, existing.serverId, templateData);
        } else {
            // Template belum punya serverId - buat baru di server
            const serverResult = await syncManager.createTemplate(deviceId, templateData);
            if (serverResult) {
                templateData.serverId = serverResult.serverId;
            }
        }

        const data = {
            id,
            ...templateData,
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');

            const request = store.put(data);

            request.onsuccess = () => {
                console.log('Template updated:', id);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error updating template');
                reject(request.error);
            };
        });
    }

    // Ambil semua template
    async getAllTemplates() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readonly');
            const store = transaction.objectStore('templates');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error getting templates');
                reject(request.error);
            };
        });
    }

    // Ambil template berdasarkan ID
    async getTemplate(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readonly');
            const store = transaction.objectStore('templates');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error getting template');
                reject(request.error);
            };
        });
    }

    // Hapus template
    async deleteTemplate(id) {
        const deviceId = getDeviceId();
        const existing = await this.getTemplate(id);

        // Hapus dari server
        if (existing != null && existing.serverId) {
            await syncManager.deleteTemplate(deviceId, existing.serverId);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('Template deleted:', id);
                resolve();
            };

            request.onerror = () => {
                console.error('Error deleting template');
                reject(request.error);
            };
        });
    }

    // Sinkronisasi ke server: push template lokal yang belum ada di server
    async syncToServer() {
        const deviceId = getDeviceId();
        const localTemplates = await this.getAllTemplates();
        let synced = 0;

        const syncOne = async (t) => {
            if (t.serverId) {
                const { id, serverId, createdAt, updatedAt, ...rest } = t;
                const ok = await syncManager.updateTemplate(deviceId, serverId, rest);
                if (ok) return true;
            } else {
                const { id, createdAt, updatedAt, ...rest } = t;
                const serverResult = await syncManager.createTemplate(deviceId, rest);
                if (serverResult != null && serverResult.serverId) {
                    const transaction = this.db.transaction(['templates'], 'readwrite');
                    const store = transaction.objectStore('templates');
                    await new Promise((resolve, reject) => {
                        const req = store.put({ ...t, serverId: serverResult.serverId, updatedAt: new Date().toISOString() });
                        req.onsuccess = () => resolve();
                        req.onerror = () => reject(req.error);
                    });
                    return true;
                }
            }
            return false;
        };

        const results = await Promise.allSettled(localTemplates.map(syncOne));
        synced = results.filter(r => r.status === 'fulfilled' && r.value === true).length;

        return synced;
    }

    // Cari template berdasarkan nama
    async searchTemplates(name) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readonly');
            const store = transaction.objectStore('templates');
            const index = store.index('name');
            const request = index.getAll(name);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error searching templates');
                reject(request.error);
            };
        });
    }
}

// Inisialisasi database manager
const db = new DatabaseManager();
