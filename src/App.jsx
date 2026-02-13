import { useState, useEffect } from 'react';
import './App.css';

const API_KEY = '7ee61d0fad752006cd360f3e3db049c6';
const API_URL = 'https://api.openweathermap.org/data/2.5';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const savedDiary = JSON.parse(localStorage.getItem('diary') || '[]');
    setFavorites(savedFavorites);
    setDiary(savedDiary);
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('diary', JSON.stringify(diary));
  }, [diary]);

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const weatherRes = await fetch(
        `${API_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=ru`
      );
      
      if (!weatherRes.ok) {
        throw new Error('Город не найден');
      }
      
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const forecastRes = await fetch(
        `${API_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=ru`
      );
      const forecastData = await forecastRes.json();
      
      const dailyForecast = forecastData.list.filter((item) =>
        item.dt_txt.includes('12:00:00')
      );
      setForecast(dailyForecast.slice(0, 5));
      
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const addToFavorites = () => {
    if (weather && !favorites.find(fav => fav.id === weather.id)) {
      setFavorites([...favorites, {
        id: weather.id,
        name: weather.name,
        country: weather.sys.country
      }]);
    }
  };

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const addToDiary = () => {
    if (weather && note.trim()) {
      setDiary([{
        id: Date.now(),
        date: new Date().toLocaleString('ru-RU'),
        city: weather.name,
        temp: Math.round(weather.main.temp),
        description: weather.weather[0].description,
        note: note
      }, ...diary]);
      setNote('');
    }
  };

  const removeDiaryEntry = (id) => {
    setDiary(diary.filter(entry => entry.id !== id));
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600">
      {}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white text-center mb-2">
            🌤️ WeatherApp
          </h1>
          <p className="text-white/90 text-center">Прогноз погоды в реальном времени</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Введите название города..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 px-6 py-4 rounded-full text-lg border-none shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
            />
            <button 
              type="submit"
              className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold shadow-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
            >
              🔍 Найти
            </button>
          </div>
        </form>

        {}
        {favorites.length > 0 && (
          <div className="mb-8 bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">⭐ Избранные города</h3>
            <div className="flex flex-wrap gap-2">
              {favorites.map((fav) => (
                <div key={fav.id} className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <button
                    onClick={() => fetchWeather(fav.name)}
                    className="text-white hover:text-blue-200 transition-colors font-medium"
                  >
                    {fav.name}, {fav.country}
                  </button>
                  <button
                    onClick={() => removeFromFavorites(fav.id)}
                    className="text-white/70 hover:text-red-300 transition-colors text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {error && (
          <div className="mb-8 bg-red-500/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-red-400">
            <p className="text-white text-center font-semibold">⚠️ {error}</p>
          </div>
        )}

        {}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg font-medium">Загрузка...</p>
          </div>
        )}

        {}
        {weather && !loading && (
          <div className="mb-8 bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/40 fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">
                  {weather.name}, {weather.sys.country}
                </h2>
                <p className="text-gray-500 capitalize">{weather.weather[0].description}</p>
              </div>
              <button 
                onClick={addToFavorites}
                className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-full font-semibold hover:bg-yellow-300 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                ⭐ В избранное
              </button>
            </div>
            
            {}
            <div className="flex items-center justify-center mb-6">
              <img
                src={getWeatherIcon(weather.weather[0].icon)}
                alt={weather.weather[0].description}
                className="w-32 h-32"
              />
              <div className="text-7xl font-bold text-gray-800">
                {Math.round(weather.main.temp)}°C
              </div>
            </div>
            
            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <div className="text-gray-500 text-sm mb-1">Ощущается</div>
                <div className="text-2xl font-bold text-gray-800">{Math.round(weather.main.feels_like)}°C</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <div className="text-gray-500 text-sm mb-1">Влажность</div>
                <div className="text-2xl font-bold text-gray-800">{weather.main.humidity}%</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <div className="text-gray-500 text-sm mb-1">Ветер</div>
                <div className="text-2xl font-bold text-gray-800">{Math.round(weather.wind.speed)} м/с</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <div className="text-gray-500 text-sm mb-1">Давление</div>
                <div className="text-2xl font-bold text-gray-800">{weather.main.pressure} гПа</div>
              </div>
            </div>

            {}
            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">📝 Добавить в погодный дневник</h3>
              <textarea
                placeholder="Ваша заметка о погоде..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none resize-none mb-3"
                rows="3"
              />
              <button 
                onClick={addToDiary}
                className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Добавить запись
              </button>
            </div>
          </div>
        )}

        {}
        {forecast.length > 0 && !loading && (
          <div className="mb-8 bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/40 fade-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📅 Прогноз на 5 дней</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 text-center shadow-md hover:shadow-xl transition-shadow">
                  <div className="text-sm font-semibold text-gray-600 mb-2">
                    {new Date(day.dt * 1000).toLocaleDateString('ru-RU', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <img
                    src={getWeatherIcon(day.weather[0].icon)}
                    alt={day.weather[0].description}
                    className="w-16 h-16 mx-auto"
                  />
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {Math.round(day.main.temp)}°C
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {day.weather[0].description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {diary.length > 0 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/40 fade-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📌 Погодный дневник</h3>
            <div className="space-y-4">
              {diary.map((entry) => (
                <div key={entry.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-lg font-bold text-gray-800">{entry.city}</div>
                      <div className="text-sm text-gray-500">{entry.date}</div>
                    </div>
                    <button
                      onClick={() => removeDiaryEntry(entry.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-xl"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-purple-600">{entry.temp}°C</span>
                    <span className="text-gray-600 capitalize">{entry.description}</span>
                  </div>
                  <div className="text-gray-700 bg-white/50 rounded-xl p-3">
                    {entry.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 py-6 mt-12">
        <p className="text-white text-center">Powered by OpenWeather API</p>
      </footer>
    </div>
  );
}

export default App;