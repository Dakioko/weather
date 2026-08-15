const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const getApiKey = () => import.meta.env.VITE_WEATHER_API_KEY;

export async function getWeather(city, unit = 'metric') {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${unit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('City not found');
  return res.json();
}

export async function getWeatherByCoords(lat, lon, unit = 'metric') {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Location not found');
  return res.json();
}

export async function getForecast(city, unit = 'metric') {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${unit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast not available');
  return res.json();
}

export async function getForecastByCoords(lat, lon, unit = 'metric') {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast not available');
  return res.json();
}

export async function getAirQuality(lat, lon) {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Air quality not available');
  return res.json();
}
