interface OpenMeteoResponse {
  hourly?: {
    time?: string[];
    wave_height?: Array<number | null>;
    sea_surface_temperature?: Array<number | null>;
  };
}

export interface OpenMeteoMarineData {
  seaTemperature: number | null;
  waveHeight: number | null;
}

export async function getOpenMeteoMarineData(
  latitude: number,
  longitude: number,
): Promise<OpenMeteoMarineData> {
  const url = new URL('https://marine-api.open-meteo.com/v1/marine');

  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set(
    'hourly',
    'wave_height,sea_surface_temperature',
  );
  url.searchParams.set('forecast_days', '1');

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Open-Meteo request failed with status ${response.status}`,
    );
  }

  const data = (await response.json()) as OpenMeteoResponse;

  const hourly = data.hourly;

  if (!hourly) {
    throw new Error('Open-Meteo returned no hourly data');
  }

  const seaTemperature =
    hourly.sea_surface_temperature?.find(
      (value): value is number => value !== null,
    ) ?? null;

  const waveHeight =
    hourly.wave_height?.find(
      (value): value is number => value !== null,
    ) ?? null;

  return {
    seaTemperature,
    waveHeight,
  };
}