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
    <GlassCard className="aspect-square bg-blue-500/20" noPadding>
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-base-content flex items-center gap-2 m-0">
            <MapPin className="w-5 h-5 text-primary" /> {t.widgets.weather.title}
          </h3>
          <p className="text-[10px] opacity-50">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="p-2 rounded-2xl bg-base-100/50">
            {getWeatherIcon(current.weather_code)}
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <span className="text-6xl font-bold text-base-content font-number">{Math.round(current.temperature_2m)}°</span>
          <div className="text-sm">
            <p className="font-bold text-base-content text-lg">{getWeatherCondition(current.weather_code)}</p>
            <p className="opacity-60 font-medium">
              H:{Math.round(daily.temperature_2m_max[0])}° L:{Math.round(daily.temperature_2m_min[0])}°
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-white/10 text-[10px]">
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-base-100/30">
            <Wind className="w-3 h-3 opacity-50" />
            <span className="font-bold">{current.wind_speed_10m}</span>
            <span className="opacity-50 scale-90">km/h</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-base-100/30">
            <CloudRain className="w-3 h-3 opacity-50" />
            <span className="font-bold">{getWeatherCondition(current.weather_code) === 'Rainy' ? 'High' : 'Low'}</span>
            <span className="opacity-50 scale-90">{t.widgets.weather.precip}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-base-100/30">
            <Cloud className="w-3 h-3 opacity-50" />
            <span className="font-bold">{current.relative_humidity_2m}%</span>
            <span className="opacity-50 scale-90">{t.widgets.weather.humidity}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default WeatherWidget;
