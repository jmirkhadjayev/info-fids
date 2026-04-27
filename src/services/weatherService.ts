export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

export async function fetchTashkentWeather(): Promise<WeatherData | null> {
  try {
    const lat = 41.2995;
    const lon = 69.2401;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await response.json();
    
    if (data.current_weather) {
      const { temperature, weathercode } = data.current_weather;
      return {
        temp: Math.round(temperature),
        condition: getWeatherCondition(weathercode),
        icon: getWeatherIcon(weathercode)
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

function getWeatherCondition(code: number): string {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

function getWeatherIcon(code: number): string {
  if (code === 0) return 'Sun';
  if (code <= 3) return 'CloudSun';
  if (code <= 48) return 'CloudFog';
  if (code <= 67) return 'CloudRain';
  if (code <= 77) return 'CloudSnow';
  if (code <= 82) return 'CloudRain';
  if (code <= 86) return 'CloudSnow';
  if (code >= 95) return 'CloudLightning';
  return 'Cloud';
}
