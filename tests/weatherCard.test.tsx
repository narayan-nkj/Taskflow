import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeatherCard } from '../src/components/dashboard/WeatherCard';
import * as useWeatherModule from '../src/hooks/useWeather';
import { CurrentWeather, WeatherLocation } from '../src/services/weatherService';

describe('WeatherCard component', () => {
  const mockLocation: WeatherLocation = {
    name: 'Kolkata',
    latitude: 22.56,
    longitude: 88.36,
    country: 'India',
    admin1: 'West Bengal',
  };

  const mockWeather: CurrentWeather = {
    temperature: 28,
    apparentTemperature: 32,
    weatherCode: 2,
    condition: 'Partly Cloudy',
    iconName: 'CloudSun',
    isDay: true,
    updatedAt: '06:00 PM',
    tempMax: 34,
    tempMin: 26,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial unconfigured state with explicit location and search options', () => {
    const detectLocation = vi.fn();
    vi.spyOn(useWeatherModule, 'useWeather').mockReturnValue({
      location: null,
      weather: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      detectLocation,
      selectLocation: vi.fn(),
      searchCities: vi.fn(),
    });

    render(<WeatherCard />);

    expect(screen.getByText(/check live conditions and forecasts/i)).toBeInTheDocument();
    const myLocationBtn = screen.getByRole('button', { name: /use my location/i });
    const searchCityBtn = screen.getByRole('button', { name: /search city/i });

    expect(myLocationBtn).toBeInTheDocument();
    expect(searchCityBtn).toBeInTheDocument();

    // Verify geolocation is not called automatically without click
    expect(detectLocation).not.toHaveBeenCalled();

    // Explicit click calls detectLocation
    fireEvent.click(myLocationBtn);
    expect(detectLocation).toHaveBeenCalledTimes(1);
  });

  it('allows user to search and select a city', async () => {
    const searchCities = vi.fn().mockResolvedValue([mockLocation]);
    const selectLocation = vi.fn();

    vi.spyOn(useWeatherModule, 'useWeather').mockReturnValue({
      location: null,
      weather: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      detectLocation: vi.fn(),
      selectLocation,
      searchCities,
    });

    render(<WeatherCard />);

    // Click "Search City" to open search form
    fireEvent.click(screen.getByRole('button', { name: /search city/i }));

    const searchInput = screen.getByPlaceholderText(/enter city/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Kolkata' } });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(searchCities).toHaveBeenCalledWith('Kolkata');
    });

    // Results appear
    const cityResult = await screen.findByRole('button', { name: /kolkata/i });
    expect(cityResult).toBeInTheDocument();

    fireEvent.click(cityResult);
    expect(selectLocation).toHaveBeenCalledWith(mockLocation);
  });

  it('renders active weather data truthfully when location and weather are present', () => {
    const refresh = vi.fn();

    vi.spyOn(useWeatherModule, 'useWeather').mockReturnValue({
      location: mockLocation,
      weather: mockWeather,
      isLoading: false,
      error: null,
      refresh,
      detectLocation: vi.fn(),
      selectLocation: vi.fn(),
      searchCities: vi.fn(),
    });

    render(<WeatherCard />);

    expect(screen.getByText('• Kolkata')).toBeInTheDocument();
    expect(screen.getByText('28°C')).toBeInTheDocument();
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
    expect(screen.getByText(/feels 32°c/i)).toBeInTheDocument();
    expect(screen.getByText(/h: 34° • l: 26°/i)).toBeInTheDocument();
    expect(screen.getByText(/updated 06:00 pm/i)).toBeInTheDocument();

    const refreshBtn = screen.getByRole('button', { name: /refresh weather data/i });
    fireEvent.click(refreshBtn);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('renders error state with retry and search buttons when error occurs', () => {
    const refresh = vi.fn();

    vi.spyOn(useWeatherModule, 'useWeather').mockReturnValue({
      location: mockLocation,
      weather: null,
      isLoading: false,
      error: 'Unable to reach weather service. Check network.',
      refresh,
      detectLocation: vi.fn(),
      selectLocation: vi.fn(),
      searchCities: vi.fn(),
    });

    render(<WeatherCard />);

    expect(screen.getByText('Unable to reach weather service. Check network.')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
