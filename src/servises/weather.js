const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE = "https://api.openweathermap.org/data/2.5";

export async function getWeather(lat, lon) {
  const res = await fetch(
    `${BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  return res.json();
}

export async function getAQI(lat, lon) {
  const res = await fetch(
    `${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  return res.json();
}
