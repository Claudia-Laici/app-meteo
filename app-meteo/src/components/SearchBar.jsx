import React, { useState } from "react";

import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
} from "lucide-react";

const SearchBar = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_URL = "https://api.openweathermap.org/data/2.5";

  // Funzione per mappare i codici meteo alle icone
  const getWeatherIconType = (weatherCode, isDay = true) => {
    if (weatherCode >= 200 && weatherCode < 300) return "stormy"; // Temporale
    if (weatherCode >= 300 && weatherCode < 400) return "drizzle"; // pioggia leggera
    if (weatherCode >= 500 && weatherCode < 600) return "rainy"; // pioggia
    if (weatherCode >= 600 && weatherCode < 700) return "snowy"; // neve
    if (weatherCode >= 700 && weatherCode < 800) return "cloudy"; // nebbia
    if (weatherCode === 800) return "sunny"; // Sereno
    if (weatherCode > 800) return "cloudy"; // Nuvoloso
    return "sunny";
  };

  const searchWeather = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Chiamata API per ottenere le coordinate della città
      const geoResponse = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric&lang=it`
      );

      const forecastRes = await fetch(
        `${BASE_URL}/forecast?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric&lang=it`
      );

      if (!geoResponse.ok) {
        if (geoResponse.status === 404) {
          throw new Error("City not found. Check the name and try again.");
        } else if (geoResponse.status === 401) {
          throw new Error(
            "API error: Invalid API key. Please enter your OpenWeatherMap API key."
          );
        } else {
          throw new Error("Error retrieving weather data.");
        }
      }
      const weatherResponse = await geoResponse.json();
      const forecastData = await forecastRes.json();

      const dailyForecasts = forecastData.list
        .filter((entry) => entry.dt_txt.includes("12:00:00"))
        .map((entry) => ({
          date: entry.dt_txt.split(" ")[0],
          temp: Math.round(entry.main.temp),
          icon: getWeatherIconType(entry.weather[0].id),
          description: entry.weather[0].description,
        }));

      // Formato dei dati per il componente

      const formattedData = {
        city: weatherResponse.name,
        country: weatherResponse.sys.country,
        temperature: Math.round(weatherResponse.main.temp),
        description:
          weatherResponse.weather[0].description.charAt(0).toUpperCase() +
          weatherResponse.weather[0].description.slice(1),
        humidity: weatherResponse.main.humidity,
        windSpeed: Math.round(weatherResponse.wind.speed * 3.6), // Conversione m/s a km/h
        visibility: Math.round(weatherResponse.visibility / 1000), // Conversione m a km
        pressure: weatherResponse.main.pressure,
        icon: getWeatherIconType(weatherResponse.weather[0].id),
        feelsLike: Math.round(weatherResponse.main.feels_like),
        tempMin: Math.round(weatherResponse.main.temp_min),
        tempMax: Math.round(weatherResponse.main.temp_max),
        forecast: dailyForecasts,
      };

      setWeatherData(formattedData);
      setError("");
    } catch (err) {
      console.error("Weather search error:", err);
      setError(err.message || "Error retrieving weather data.");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchWeather(city);
  };

  const getWeatherIcon = (iconType) => {
    switch (iconType) {
      case "sunny":
        return <Sun className="w-16 h-16 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="w-16 h-16 text-gray-500" />;
      case "rainy":
        return <CloudRain className="w-16 h-16 text-blue-500" />;
      case "snowy":
        return <CloudSnow className="w-16 h-16 text-blue-300" />;
      case "stormy":
        return <Zap className="w-16 h-16 text-purple-500" />;
      default:
        return <Sun className="w-16 h-16 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white mb-2">☀️ Meteo App</h1>
          <p className="text-blue-100 text-lg">
            Scopri le condizioni meteorologiche della tua città
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                placeholder="Inserisci il nome della città..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
              />
            </div>
            <button
              onClick={searchWeather}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? "Ricerca..." : "Cerca"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-300 text-red-100 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Weather Data */}
        {weatherData && (
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-white" />
                <h2 className="text-2xl font-bold text-white">
                  {weatherData.city}, {weatherData.country}
                </h2>
              </div>
              <div className="flex items-center justify-center gap-4 mb-4">
                {getWeatherIcon(weatherData.icon)}
                <div>
                  <div className="text-5xl font-bold text-white">
                    {weatherData.temperature}°C
                  </div>
                  <div className="text-blue-100 text-lg">
                    {weatherData.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Droplets className="w-6 h-6 text-blue-200 mx-auto mb-2" />
                <div className="text-sm text-blue-100">Umidità</div>
                <div className="text-lg font-bold text-white">
                  {weatherData.humidity}%
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Wind className="w-6 h-6 text-blue-200 mx-auto mb-2" />
                <div className="text-sm text-blue-100">Vento</div>
                <div className="text-lg font-bold text-white">
                  {weatherData.windSpeed} km/h
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Eye className="w-6 h-6 text-blue-200 mx-auto mb-2" />
                <div className="text-sm text-blue-100">Visibilità</div>
                <div className="text-lg font-bold text-white">
                  {weatherData.visibility} km
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Thermometer className="w-6 h-6 text-blue-200 mx-auto mb-2" />
                <div className="text-sm text-blue-100">Pressione</div>
                <div className="text-lg font-bold text-white">
                  {weatherData.pressure} hPa
                </div>
              </div>
            </div>

            {/* Additional Weather Info */}
            <div className="bg-white/10 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-blue-100">Percepita</div>
                  <div className="text-lg font-bold text-white">
                    {weatherData.feelsLike}°C
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-100">Min</div>
                  <div className="text-lg font-bold text-white">
                    {weatherData.tempMin}°C
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-100">Max</div>
                  <div className="text-lg font-bold text-white">
                    {weatherData.tempMax}°C
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!weatherData && !loading && (
          <div className="space-y-3">
            <p className="text-blue-100">
              <strong>Prova a cercare qualsiasi città del mondo:</strong>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <span className="bg-white/10 px-3 py-1 rounded text-white">
                Milano
              </span>
              <span className="bg-white/10 px-3 py-1 rounded text-white">
                Roma
              </span>
              <span className="bg-white/10 px-3 py-1 rounded text-white">
                New York
              </span>
              <span className="bg-white/10 px-3 py-1 rounded text-white">
                London
              </span>
              <span className="bg-white/10 px-3 py-1 rounded text-white">
                Tokyo
              </span>
              <span className="bg-white/10 px-3 py-1 rounded text-white">
                Paris
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
