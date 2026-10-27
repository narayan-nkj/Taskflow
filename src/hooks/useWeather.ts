import { useState, useEffect, useCallback } from 'react';
import {
  WeatherLocation,
  CurrentWeather,
  getSavedLocation,
  saveLocation,
  clearSavedLocation,
  getCachedWeather,
  fetchWeatherFromApi,
  searchCitiesApi,
} from '../services/weatherService';

export function useWeather() {
  const [location, setLocationState] = useState<WeatherLocation | null>(getSavedLocation);
  const [weather, setWeather] = useState<CurrentWeather | null>(() => {
    const loc = getSavedLocation();
    if (loc) {
      return getCachedWeather(loc.latitude, loc.longitude);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather for a given coordinate
  const loadWeather = useCallback(async (loc: WeatherLocation, bypassCache = false) => {
    setIsLoading(true);
    setError(null);

    if (!bypassCache) {
      const cached = getCachedWeather(loc.latitude, loc.longitude);
      if (cached) {
        setWeather(cached);
        setIsLoading(false);
        return;
      }
    }

    try {
      const data = await fetchWeatherFromApi(loc.latitude, loc.longitude);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load weather forecast');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount if location is already known
  useEffect(() => {
    if (location) {
      loadWeather(location);
    }
  }, [location, loadWeather]);

  // Explicit user action: Request browser geolocation
  const detectLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: WeatherLocation = {
          name: 'Current Location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          isGeolocation: true,
        };
        saveLocation(loc);
        setLocationState(loc);
        loadWeather(loc, true);
      },
      (err) => {
        setIsLoading(false);
        if (err.code === 1) {
          setError('Location access denied. Please search for your city manually below.');
        } else {
          setError('Unable to detect GPS position. Try searching by city name.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [loadWeather]);

  // Set location from manual search
  const selectLocation = useCallback(
    (loc: WeatherLocation) => {
      saveLocation(loc);
      setLocationState(loc);
      loadWeather(loc, true);
    },
    [loadWeather]
  );

  // Clear location
  const resetLocation = useCallback(() => {
    clearSavedLocation();
    setLocationState(null);
    setWeather(null);
    setError(null);
  }, []);

  // Refresh current location weather
  const refresh = useCallback(() => {
    if (location) {
      loadWeather(location, true);
    }
  }, [location, loadWeather]);

  return {
    location,
    weather,
    isLoading,
    error,
    refresh,
    detectLocation,
    selectLocation,
    resetLocation,
    searchCities: searchCitiesApi,
  };
}
