// Database Manager menggunakan IndexedDB
class DatabaseManager {
    constructor() {
        this.dbName = 'WatermarkDB';
        this.version = 1;
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
                const db = event.target.result;

                // Buat object store untuk templates
                if (!db.objectStoreNames.contains('templates')) {
                    const templateStore = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
                    templateStore.createIndex('name', 'name', { unique: false });
                    templateStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    // Simpan template baru
    async saveTemplate(templateData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');

            const data = {
                ...templateData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

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
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');

            const data = {
                id,
                ...templateData,
                updatedAt: new Date().toISOString()
            };

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
