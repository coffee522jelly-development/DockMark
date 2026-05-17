import React from 'react';
import { Cloud, CloudRain, Sun, Wind } from 'lucide-react';

const WeatherWidget: React.FC = () => {
  // Mock weather data
  const weather = {
    temp: 22,
    condition: 'Sunny',
    location: 'Tokyo',
    high: 25,
    low: 18,
    humidity: 45
  };

  return (
    <div className="card bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-xl">
      <div className="card-body p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{weather.location}</h3>
            <p className="text-xs opacity-80">Monday, 10:00 AM</p>
          </div>
          <Sun className="w-10 h-10 text-yellow-300" />
        </div>

        <div className="flex items-center gap-4 my-2">
          <span className="text-5xl font-bold">{weather.temp}°</span>
          <div className="text-sm">
            <p className="font-bold">{weather.condition}</p>
            <p className="opacity-80">H:{weather.high}° L:{weather.low}°</p>
          </div>
        </div>

        <div className="flex justify-between mt-2 pt-4 border-t border-white/20 text-xs">
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3" />
            <span>5 km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <CloudRain className="w-3 h-3" />
            <span>10%</span>
          </div>
          <div className="flex items-center gap-1">
            <Cloud className="w-3 h-3" />
            <span>{weather.humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
