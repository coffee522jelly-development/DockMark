import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, MapPin, Loader2 } from 'lucide-react';

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await response.json();
        setWeather(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch weather');
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to Tokyo if geolocation fails
          fetchWeather(35.6895, 139.6917);
        }
      );
    } else {
      fetchWeather(35.6895, 139.6917);
    }
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-10 h-10 text-yellow-300" />;
    if (code <= 3) return <Cloud className="w-10 h-10 text-blue-200" />;
    if (code >= 51) return <CloudRain className="w-10 h-10 text-blue-300" />;
    return <Sun className="w-10 h-10 text-yellow-300" />;
  };

  const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code >= 51) return 'Rainy';
    return 'Clear Sky';
  };

  if (loading) {
    return (
      <div className="card bg-blue-500 text-white shadow-xl h-80 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-50" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="card bg-blue-500 text-white shadow-xl p-5 h-80 flex items-center justify-center">
        <p>Weather data unavailable</p>
      </div>
    );
  }

  const current = weather.current;
  const daily = weather.daily;

  return (
    <div className="card bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-xl h-80">
      <div className="card-body p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Current Location
            </h3>
            <p className="text-xs opacity-80">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {getWeatherIcon(current.weather_code)}
        </div>

        <div className="flex items-center gap-4 my-2">
          <span className="text-5xl font-bold">{Math.round(current.temperature_2m)}°</span>
          <div className="text-sm">
            <p className="font-bold">{getWeatherCondition(current.weather_code)}</p>
            <p className="opacity-80">
              H:{Math.round(daily.temperature_2m_max[0])}° L:{Math.round(daily.temperature_2m_min[0])}°
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-2 pt-4 border-t border-white/20 text-xs">
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3" />
            <span>{current.wind_speed_10m} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <CloudRain className="w-3 h-3" />
            <span>{getWeatherCondition(current.weather_code) === 'Rainy' ? 'High' : 'Low'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Cloud className="w-3 h-3" />
            <span>{current.relative_humidity_2m}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
