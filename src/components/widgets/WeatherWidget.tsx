import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, MapPin, Loader2 } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

const WeatherWidget: React.FC = () => {
  const { t } = useTranslation();
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
      <GlassCard className="aspect-square flex items-center justify-center border-blue-500/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
      </GlassCard>
    );
  }

  if (error || !weather) {
    return (
      <GlassCard className="aspect-square flex items-center justify-center">
        <p className="text-error opacity-70">{t.widgets.weather.unavailable}</p>
      </GlassCard>
    );
  }

  const current = weather.current;
  const daily = weather.daily;

  return (
    <GlassCard className="aspect-square flex flex-col p-5 bg-blue-500/20">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-base-content m-0">{t.widgets.weather.title}</h3>
        </div>
        <p className="text-[10px] opacity-50">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2 rounded-2xl bg-base-100/50 shrink-0">
            {getWeatherIcon(current.weather_code)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-base-content font-number leading-none tracking-tighter">
                {Math.round(current.temperature_2m)}°
              </span>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <p className="font-bold text-base-content text-sm truncate">{getWeatherCondition(current.weather_code)}</p>
          <p className="opacity-60 text-xs font-medium">
            H:{Math.round(daily.temperature_2m_max[0])}° L:{Math.round(daily.temperature_2m_min[0])}°
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 mt-auto pt-2 border-t border-white/10 text-[9px]">
          <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-base-100/30">
            <Wind className="w-3 h-3 opacity-50" />
            <span className="font-bold truncate w-full text-center">{current.wind_speed_10m}</span>
            <span className="opacity-50 scale-90">km/h</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-base-100/30">
            <CloudRain className="w-3 h-3 opacity-50" />
            <span className="font-bold truncate w-full text-center">{getWeatherCondition(current.weather_code) === 'Rainy' ? 'High' : 'Low'}</span>
            <span className="opacity-50 scale-90 truncate w-full text-center">{t.widgets.weather.precip}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-base-100/30">
            <Cloud className="w-3 h-3 opacity-50" />
            <span className="font-bold truncate w-full text-center">{current.relative_humidity_2m}%</span>
            <span className="opacity-50 scale-90 truncate w-full text-center">{t.widgets.weather.humidity}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default WeatherWidget;
