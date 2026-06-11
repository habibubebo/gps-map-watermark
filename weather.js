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
            const res = await fetch(
                `${this.reverseUrl}?lat=${lat}&lon=${lng}&format=json&accept-language=id&zoom=18`,
                { headers: { 'Accept-Language': 'id' } }
            );
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
            console.warn('Reverse geocode gagal:', e);
            return null;
        }
    }

    // Ambil koordinat dari nama kota
    async getCoordinates(cityName) {
        const res  = await fetch(`${this.geocodeUrl}?name=${encodeURIComponent(cityName)}&count=1&language=id&format=json`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            const r = data.results[0];
            return { latitude: r.latitude, longitude: r.longitude, name: r.name, country: r.country };
        }
        throw new Error('Kota tidak ditemukan');
    }

    // Ambil data cuaca dari koordinat
    async getWeather(lat, lng) {
        const res  = await fetch(
            `${this.weatherUrl}?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`
        );
        const data = await res.json();
        if (!data.current) throw new Error('Gagal mengambil data cuaca');
        return {
            temperature:  parseFloat(data.current.temperature_2m).toFixed(2),
            weatherCode:  data.current.weather_code,
            windSpeed:    parseFloat(data.current.wind_speed_10m).toFixed(2),
            humidity:     data.current.relative_humidity_2m,
            description:  this.getWeatherDescription(data.current.weather_code),
        };
    }

    // Ambil cuaca berdasarkan nama kota
    async getWeatherByCity(cityName) {
        const coords  = await this.getCoordinates(cityName);
        const weather = await this.getWeather(coords.latitude, coords.longitude);
        return { ...weather, city: coords.name, country: coords.country,
                 latitude: coords.latitude, longitude: coords.longitude };
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
