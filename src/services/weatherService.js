const LOCATION_STORAGE_KEY = 'taskflow_weather_location_v1';
const CACHE_STORAGE_KEY = 'taskflow_weather_cache_v1';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

/**
 * @returns {object | null}
 */
export function getSavedLocation() {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * @param {object} loc
 */
export function saveLocation(loc) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // Ignore storage quota
  }
}

export function clearSavedLocation() {
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {object | null}
 */
export function getCachedWeather(lat, lon) {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (
      entry &&
      Math.abs(entry.lat - lat) < 0.01 &&
      Math.abs(entry.lon - lon) < 0.01 &&
      Date.now() - entry.timestamp < CACHE_TTL_MS
    ) {
      return entry.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {number} lat
 * @param {number} lon
 * @param {object} data
 */
export function setCachedWeather(lat, lon, data) {
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ lat, lon, data, timestamp: Date.now() })
    );
  } catch {
    // Ignore
  }
}

/**
 * Maps WMO weather code to recognizable condition label and Lucide icon.
 *
 * @param {number} code
 * @param {boolean} [isDay=true]
 * @returns {{ condition: string, iconName: string }}
 */
export function mapWeatherCode(code, isDay = true) {
  if (code === 0) return { condition: isDay ? 'Clear Sky' : 'Clear Night', iconName: 'Sun' };
  if (code === 1) return { condition: 'Mainly Clear', iconName: 'Sun' };
  if (code === 2) return { condition: 'Partly Cloudy', iconName: 'CloudSun' };
  if (code === 3) return { condition: 'Overcast', iconName: 'Cloud' };
  if (code === 45 || code === 48) return { condition: 'Foggy', iconName: 'CloudFog' };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', iconName: 'CloudDrizzle' };
  if (code >= 61 && code <= 65) return { condition: 'Rain', iconName: 'CloudRain' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { condition: 'Snow', iconName: 'CloudSnow' };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', iconName: 'CloudRain' };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', iconName: 'CloudLightning' };
  return { condition: 'Partly Cloudy', iconName: 'CloudSun' };
}

/**
 * Fetch current weather from Open-Meteo public no-key endpoint.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
export async function fetchWeatherFromApi(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Weather service responded with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.current) {
      throw new Error('Malformed weather response');
    }

    const isDay = data.current.is_day === 1;
    const { condition, iconName } = mapWeatherCode(data.current.weather_code, isDay);

    const result = {
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      weatherCode: data.current.weather_code,
      condition,
      iconName,
      isDay,
      tempMax: data.daily?.temperature_2m_max?.[0] !== undefined ? Math.round(data.daily.temperature_2m_max[0]) : undefined,
      tempMin: data.daily?.temperature_2m_min?.[0] !== undefined ? Math.round(data.daily.temperature_2m_min[0]) : undefined,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCachedWeather(latitude, longitude, result);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Weather request timed out. Please try again.');
    }
    throw err instanceof Error ? err : new Error('Failed to load weather data');
  }
}

/**
 * Search cities using Open-Meteo geocoding API.
 *
 * @param {string} query
 * @returns {Promise<Array<object>>}
 */
export async function searchCitiesApi(query) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((r) => ({
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}
