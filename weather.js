// Weather & Geocoding Manager
class WeatherManager {
    constructor() {
        this.geocodeUrl  = 'https://geocoding-api.open-meteo.com/v1/search';
        this.weatherUrl  = 'https://api.open-meteo.com/v1/forecast';
        this.reverseUrl  = 'https://nominatim.openstreetmap.org/reverse';
        
        // Load Open Location Code library
        this.loadOpenLocationCode();
    }

    // Load Open Location Code library dari CDN
    loadOpenLocationCode() {
        if (typeof olc !== 'undefined') {
            this.olc = olc;
        } else {
            // Akan di-load via script tag di HTML
            console.log('Waiting for Open Location Code library...');
        }
    }

    // Hitung Plus Code dari koordinat
    calculatePlusCode(lat, lng) {
        try {
            if (typeof olc !== 'undefined') {
                return olc.encode(lat, lng, 10); // 10 digit precision
            }
            return null;
        } catch (e) {
            console.warn('Gagal menghitung Plus Code:', e);
            return null;
        }
    }

    // Reverse geocode: koordinat → alamat lengkap dengan Plus Code
    async reverseGeocode(lat, lng) {
        try {
            const url = `${this.reverseUrl}?lat=${lat}&lon=${lng}&format=json&accept-language=id&zoom=18`;
            const res = await offlineHandler.fetchWithRetry(url, {
                headers: { 'Accept-Language': 'id' },
                timeout: 6000
            });
            
            if (!res.ok) throw new Error('HTTP ' + res.status);
            
            const data = await res.json();
            if (data && data.display_name) {
                const addr = data.address || {};
                
                // Kumpulkan informasi detail
                const road = addr.road || addr.pedestrian || addr.footway || '';
                const suburb = addr.suburb || '';
                const village = addr.village || addr.town || addr.city_district || '';
                const county = addr.county || addr.city || '';
                const state = addr.state || '';
                
                // Hitung Plus Code
                const plusCode = this.calculatePlusCode(lat, lng);
                
                // Format: Plus Code (jika ada), Jalan, Suburb, Wilayah, Kota, Propinsi
                const parts = [];
                if (plusCode) parts.push(plusCode);
                if (road) parts.push(road);
                if (suburb && suburb !== village && suburb !== county) parts.push(suburb);
                if (village && village !== county && village !== state) parts.push(village);
                if (county && county !== state) parts.push(county);
                if (state) parts.push(state);
                
                const result = {
                    fullAddress: parts.length > 0 ? parts.join(', ') : data.display_name,
                    plusCode: plusCode,
                    road: road,
                    suburb: suburb,
                    village: village,
                    county: county,
                    state: state,
                    displayName: data.display_name
                };
                
                return result;
            }
            return null;
        } catch (e) {
            console.warn('Reverse geocode offline:', e.message);
            // Fallback: return coordinates with Plus Code (silent)
            const plusCode = this.calculatePlusCode(lat, lng);
            if (plusCode) {
                return {
                    fullAddress: plusCode + ', ' + lat.toFixed(4) + ', ' + lng.toFixed(4),
                    plusCode: plusCode,
                    offline: true
                };
            }
            return null;
        }
    }

    // Ambil koordinat dari nama kota
    async getCoordinates(cityName) {
        try {
            const url = `${this.geocodeUrl}?name=${encodeURIComponent(cityName)}&count=1&language=id&format=json`;
            const res = await offlineHandler.fetchWithCache(
                `geocode_${cityName}`,
                () => offlineHandler.fetchWithRetry(url, { timeout: 6000 })
                    .then(r => r.json()),
                86400000 // cache 24 jam
            );
            
            if (res.results && res.results.length > 0) {
                const r = res.results[0];
                return { latitude: r.latitude, longitude: r.longitude, name: r.name, country: r.country };
            }
            throw new Error('Kota tidak ditemukan');
        } catch (e) {
            console.warn('Geocode silent fail:', e.message);
            throw e;
        }
    }

    // Ambil data cuaca dari koordinat
    async getWeather(lat, lng) {
        try {
            const url = `${this.weatherUrl}?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;
            const data = await offlineHandler.fetchWithCache(
                `weather_${lat}_${lng}`,
                () => offlineHandler.fetchWithRetry(url, { timeout: 6000 })
                    .then(r => r.json()),
                1800000 // cache 30 menit
            );
            
            if (!data.current) throw new Error('No weather data');
            return {
                temperature:  parseFloat(data.current.temperature_2m).toFixed(2),
                weatherCode:  data.current.weather_code,
                windSpeed:    parseFloat(data.current.wind_speed_10m).toFixed(2),
                humidity:     data.current.relative_humidity_2m,
                description:  this.getWeatherDescription(data.current.weather_code),
                cached: data._cached || false
            };
        } catch (e) {
            console.warn('Weather silent fail:', e.message);
            // Return default weather saat offline (silent)
            return {
                temperature: '0',
                weatherCode: 0,
                windSpeed: '0',
                humidity: 0,
                description: 'Data tidak tersedia',
                offline: true
            };
        }
    }

    // Ambil cuaca berdasarkan nama kota
    async getWeatherByCity(cityName) {
        try {
            const coords  = await this.getCoordinates(cityName);
            const weather = await this.getWeather(coords.latitude, coords.longitude);
            return { ...weather, city: coords.name, country: coords.country,
                     latitude: coords.latitude, longitude: coords.longitude };
        } catch (e) {
            console.warn('Weather by city gagal:', e.message);
            throw e;
        }
    }

    // Ambil cuaca berdasarkan koordinat
    async getWeatherByCoordinates(lat, lng) {
        return this.getWeather(lat, lng);
    }

    // Deskripsi cuaca dari kode
    getWeatherDescription(code) {
        const map = {
            0:'Cerah', 1:'Sebagian Berawan', 2:'Berawan', 3:'Mendung',
            45:'Berkabut', 48:'Berkabut Beku',
            51:'Gerimis Ringan', 53:'Gerimis', 55:'Gerimis Lebat',
            61:'Hujan Ringan', 63:'Hujan', 65:'Hujan Lebat',
            71:'Salju Ringan', 73:'Salju', 75:'Salju Lebat', 77:'Butiran Salju',
            80:'Hujan Ringan', 81:'Hujan', 82:'Hujan Lebat',
            85:'Salju Ringan', 86:'Salju Lebat',
            95:'Badai', 96:'Badai Ringan', 99:'Badai Lebat'
        };
        return map[code] || 'Tidak Diketahui';
    }
}

const weather = new WeatherManager();
