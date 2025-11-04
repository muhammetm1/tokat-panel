// /src/app/api/weather/route.ts
export const runtime = 'edge';

export async function GET() {
  // Tokat koordinatları: 40.3167, 36.5500
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=40.3167&longitude=36.5500" +
    "&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
    "&timezone=Europe%2FIstanbul";

  const res = await fetch(url, { next: { revalidate: 300 } }); // 5 dakikada bir
  const data = await res.json();

  const c = data.current;
  const wx = {
    t: c.temperature_2m,
    feels: c.apparent_temperature,
    wind: c.wind_speed_10m,
    pr: c.precipitation,
    code: c.weather_code,
  };

  return new Response(JSON.stringify(wx), {
    headers: { "Content-Type": "application/json" },
  });
}
