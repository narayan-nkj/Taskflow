import React, { useState } from 'react';
import { useWeather } from '../../hooks/useWeather';
import { WeatherLocation } from '../../services/weatherService';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  MapPin,
  RotateCcw,
  Navigation,
  Search,
  X,
  AlertCircle,
  Thermometer,
} from 'lucide-react';

export const WeatherCard: React.FC = () => {
  const {
    location,
    weather,
    isLoading,
    error,
    refresh,
    detectLocation,
    selectLocation,
    searchCities,
  } = useWeather();

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchingCities(true);
    const results = await searchCities(searchQuery);
    setSearchResults(results);
    setIsSearchingCities(false);
  };

  const handleSelectCity = (city: WeatherLocation) => {
    selectLocation(city);
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderWeatherIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 text-brand-500', 'aria-hidden': true };
    switch (iconName) {
      case 'Sun':
        return <Sun {...props} />;
      case 'CloudSun':
        return <CloudSun {...props} />;
      case 'Cloud':
        return <Cloud {...props} />;
      case 'CloudFog':
        return <CloudFog {...props} />;
      case 'CloudDrizzle':
        return <CloudDrizzle {...props} />;
      case 'CloudRain':
        return <CloudRain {...props} />;
      case 'CloudSnow':
        return <CloudSnow {...props} />;
      case 'CloudLightning':
        return <CloudLightning {...props} />;
      default:
        return <CloudSun {...props} />;
    }
  };

  return (
    <div
      className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-[#202020] shadow-sm transition-all"
      aria-label="Campus Weather Widget"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-peach-100 dark:bg-[#24140E]">
            <Thermometer className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-charcoal-900 dark:text-[#F5F5F5]">
            Weather
          </span>
          {location && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#808080] truncate max-w-[120px] sm:max-w-[150px]">
              • {location.name}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          {location && !isSearching && (
            <>
              <button
                type="button"
                onClick={refresh}
                disabled={isLoading}
                className="p-1 rounded-lg text-slate-400 hover:text-charcoal-900 dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#181818] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                title="Refresh weather"
                aria-label="Refresh weather data"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-500' : ''}`} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsSearching(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-charcoal-900 dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#181818] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                title="Change city"
                aria-label="Change weather location"
              >
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* State 1: Search Form Modal/Section */}
      {isSearching ? (
        <div className="space-y-2 py-1">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city (e.g. Kolkata, London)..."
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#292929] rounded-xl text-charcoal-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            </div>
            <button
              type="submit"
              disabled={isSearchingCities || !searchQuery.trim()}
              className="px-2.5 py-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSearching(false);
                setSearchResults([]);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-[#F5F5F5] rounded-lg"
              aria-label="Cancel search"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1 py-1 custom-scrollbar">
              {searchResults.map((city, idx) => (
                <button
                  key={`${city.name}-${city.latitude}-${idx}`}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-peach-50 dark:hover:bg-[#24140E] text-charcoal-900 dark:text-[#F5F5F5] flex items-center justify-between transition-colors"
                >
                  <span className="font-medium truncate">{city.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-[#808080] shrink-0 ml-2">
                    {[city.admin1, city.country].filter(Boolean).join(', ')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Geolocation Alternative */}
          <div className="pt-1 border-t border-slate-100 dark:border-[#202020]">
            <button
              type="button"
              onClick={() => {
                setIsSearching(false);
                detectLocation();
              }}
              className="inline-flex items-center space-x-1.5 text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              <Navigation className="w-3 h-3" aria-hidden="true" />
              <span>Or use my current GPS location</span>
            </button>
          </div>
        </div>
      ) : isLoading && !weather ? (
        /* State 2: Skeleton Loading */
        <div className="flex items-center space-x-3 py-1 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#181818]" />
          <div className="space-y-1.5 flex-1">
            <div className="w-16 h-4 rounded bg-slate-100 dark:bg-[#181818]" />
            <div className="w-28 h-3 rounded bg-slate-100 dark:bg-[#181818]" />
          </div>
        </div>
      ) : error ? (
        /* State 3: Error / Fallback State */
        <div className="py-1 text-left space-y-2">
          <div className="flex items-start space-x-2 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-tight text-[11px]">{error}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => (location ? refresh() : detectLocation())}
              className="px-2.5 py-1 text-[11px] font-semibold bg-peach-100 text-brand-600 dark:bg-[#24140E] dark:text-brand-300 rounded-lg hover:bg-peach-200 transition-colors"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setIsSearching(true)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-[#B0B0B0] hover:text-charcoal-900 dark:hover:text-[#F5F5F5] rounded-lg transition-colors"
            >
              Search City
            </button>
          </div>
        </div>
      ) : !location || !weather ? (
        /* State 4: Initial Prompt (No location configured yet) */
        <div className="py-1 space-y-2">
          <p className="text-[11px] text-slate-500 dark:text-[#808080] leading-snug">
            Check live conditions and forecasts for your study sessions.
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={detectLocation}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Navigation className="w-3 h-3" aria-hidden="true" />
              <span>Use My Location</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSearching(true)}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-[#B0B0B0] hover:text-charcoal-900 dark:hover:text-[#F5F5F5] bg-slate-100 dark:bg-[#181818] rounded-xl transition-colors"
            >
              Search City
            </button>
          </div>
        </div>
      ) : (
        /* State 5: Active Weather Display */
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-peach-100/70 dark:bg-[#24140E] flex items-center justify-center shrink-0">
              {renderWeatherIcon(weather.iconName)}
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 dark:text-[#F5F5F5]">
                  {weather.temperature}°C
                </span>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {weather.condition}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-[#808080] font-medium leading-tight mt-0.5">
                {weather.tempMax !== undefined && weather.tempMin !== undefined ? (
                  <>H: {weather.tempMax}° • L: {weather.tempMin}° • </>
                ) : null}
                Feels {weather.apparentTemperature}°C
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-medium text-slate-400 dark:text-[#808080]">
              Updated {weather.updatedAt}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
