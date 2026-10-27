import { describe, it, expect, beforeEach } from 'vitest';
import {
  mapWeatherCode,
  getSavedLocation,
  saveLocation,
  clearSavedLocation,
  getCachedWeather,
  setCachedWeather,
  CurrentWeather,
} from '../src/services/weatherService';

describe('weatherService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('mapWeatherCode', () => {
    it('maps clear sky code 0', () => {
      const day = mapWeatherCode(0, true);
      expect(day.condition).toBe('Clear Sky');
      expect(day.iconName).toBe('Sun');

      const night = mapWeatherCode(0, false);
      expect(night.condition).toBe('Clear Night');
    });

    it('maps overcast code 3', () => {
      const res = mapWeatherCode(3, true);
      expect(res.condition).toBe('Overcast');
      expect(res.iconName).toBe('Cloud');
    });

    it('maps rain codes', () => {
      const res = mapWeatherCode(61, true);
      expect(res.condition).toBe('Rain');
      expect(res.iconName).toBe('CloudRain');
    });

    it('maps thunderstorm codes', () => {
      const res = mapWeatherCode(95, true);
      expect(res.condition).toBe('Thunderstorm');
      expect(res.iconName).toBe('CloudLightning');
    });
  });

  describe('Location & Weather Cache Storage', () => {
    it('saves and retrieves location', () => {
      expect(getSavedLocation()).toBeNull();

      saveLocation({
        name: 'Kolkata',
        country: 'India',
        latitude: 22.56,
        longitude: 88.36,
      });

      const loaded = getSavedLocation();
      expect(loaded).not.toBeNull();
      expect(loaded?.name).toBe('Kolkata');
      expect(loaded?.latitude).toBe(22.56);
    });

    it('clears saved location', () => {
      saveLocation({ name: 'London', latitude: 51.5, longitude: -0.12 });
      clearSavedLocation();
      expect(getSavedLocation()).toBeNull();
    });

    it('caches and retrieves weather within TTL', () => {
      const mockWeather: CurrentWeather = {
        temperature: 25,
        apparentTemperature: 28,
        weatherCode: 1,
        condition: 'Mainly Clear',
        iconName: 'Sun',
        isDay: true,
        updatedAt: '12:00 PM',
      };

      setCachedWeather(22.56, 88.36, mockWeather);
      const cached = getCachedWeather(22.56, 88.36);
      expect(cached).not.toBeNull();
      expect(cached?.temperature).toBe(25);
    });
  });
});
