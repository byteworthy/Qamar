/**
 * Prayer Times Service
 *
 * Provides prayer time calculations using the adhan npm package.
 * All calculations are done client-side, no backend required.
 *
 * NOTE: Requires 'adhan' package to be installed:
 * npm install adhan
 */

import { Coordinates, CalculationMethod, CalculationParameters, PrayerTimes, Madhab } from 'adhan';

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  date: Date;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface NextPrayer {
  name: string;
  time: Date;
  timeUntil: number; // milliseconds
}

export interface CalculationMethodInfo {
  id: string;
  name: string;
  description: string;
}

/**
 * Available calculation methods
 */
export const CALCULATION_METHODS: CalculationMethodInfo[] = [
  {
    id: 'MuslimWorldLeague',
    name: 'Muslim World League',
    description: 'Standard method used by most countries',
  },
  {
    id: 'Egyptian',
    name: 'Egyptian General Authority',
    description: 'Used in Egypt and parts of Middle East',
  },
  {
    id: 'Karachi',
    name: 'University of Islamic Sciences, Karachi',
    description: 'Used in Pakistan, Bangladesh, India',
  },
  {
    id: 'UmmAlQura',
    name: 'Umm al-Qura University',
    description: 'Used in Saudi Arabia',
  },
  {
    id: 'Dubai',
    name: 'Dubai',
    description: 'Used in UAE',
  },
  {
    id: 'Kuwait',
    name: 'Kuwait',
    description: 'Used in Kuwait',
  },
  {
    id: 'Qatar',
    name: 'Qatar',
    description: 'Used in Qatar',
  },
  {
    id: 'Singapore',
    name: 'Singapore',
    description: 'Used in Singapore',
  },
  {
    id: 'NorthAmerica',
    name: 'Islamic Society of North America',
    description: 'Used in North America',
  },
  {
    id: 'Turkey',
    name: 'Turkey',
    description: 'Used in Turkey',
  },
  {
    id: 'Tehran',
    name: 'Institute of Geophysics, Tehran',
    description: 'Used in Iran',
  },
];

/**
 * Available madhab (jurisprudence) methods for Asr calculation
 */
export const MADHAB_METHODS = [
  { id: 'Shafi', name: 'Shafi, Maliki, Hanbali' },
  { id: 'Hanafi', name: 'Hanafi' },
];

/**
 * Get calculation method from string ID
 */
function getCalculationMethod(methodId?: string): CalculationParameters {
  const methods: Record<string, CalculationParameters> = {
    MuslimWorldLeague: CalculationMethod.MuslimWorldLeague(),
    Egyptian: CalculationMethod.Egyptian(),
    Karachi: CalculationMethod.Karachi(),
    UmmAlQura: CalculationMethod.UmmAlQura(),
    Dubai: CalculationMethod.Dubai(),
    Kuwait: CalculationMethod.Kuwait(),
    Qatar: CalculationMethod.Qatar(),
    Singapore: CalculationMethod.Singapore(),
    NorthAmerica: CalculationMethod.NorthAmerica(),
    Turkey: CalculationMethod.Turkey(),
    Tehran: CalculationMethod.Tehran(),
  };

  return methods[methodId || 'MuslimWorldLeague'] || CalculationMethod.MuslimWorldLeague();
}

/**
 * Get madhab from string ID
 */
function getMadhab(madhabId?: string): typeof Madhab[keyof typeof Madhab] {
  return madhabId === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
}

/**
 * Calculate prayer times for a given location and date
 */
export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  methodId?: string,
  madhabId?: string
): PrayerTimesResult {
  const coordinates = new Coordinates(latitude, longitude);
  const params = getCalculationMethod(methodId);
  params.madhab = getMadhab(madhabId);

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    date,
    location: {
      latitude,
      longitude,
    },
  };
}

/**
 * Get the next upcoming prayer
 */
export function getNextPrayer(prayerTimes: PrayerTimesResult): NextPrayer {
  const now = new Date();
  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Sunrise', time: prayerTimes.sunrise },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha },
  ];

  // Find the next prayer that hasn't occurred yet
  for (const prayer of prayers) {
    if (prayer.time > now) {
      return {
        name: prayer.name,
        time: prayer.time,
        timeUntil: prayer.time.getTime() - now.getTime(),
      };
    }
  }

  // If all prayers have passed, return tomorrow's Fajr
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowPrayers = calculatePrayerTimes(
    prayerTimes.location.latitude,
    prayerTimes.location.longitude,
    tomorrow
  );

  return {
    name: 'Fajr',
    time: tomorrowPrayers.fajr,
    timeUntil: tomorrowPrayers.fajr.getTime() - now.getTime(),
  };
}

/**
 * Get current prayer (the one we're in the time window for)
 */
export function getCurrentPrayer(prayerTimes: PrayerTimesResult): string | null {
  const now = new Date();

  if (now >= prayerTimes.isha) return 'Isha';
  if (now >= prayerTimes.maghrib) return 'Maghrib';
  if (now >= prayerTimes.asr) return 'Asr';
  if (now >= prayerTimes.dhuhr) return 'Dhuhr';
  if (now >= prayerTimes.sunrise) return 'Dhuhr'; // Between sunrise and dhuhr
  if (now >= prayerTimes.fajr) return 'Fajr';

  return null; // Before Fajr
}

/**
 * Format prayer time to 12-hour format (e.g., "5:23 AM")
 */
export function formatPrayerTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format countdown time (e.g., "2h 15m" or "45m" or "30s")
 */
export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Calculate the Qibla direction (bearing from north) for a given location
 * Returns angle in degrees (0-360)
 */
export function getQiblaDirection(latitude: number, longitude: number): number {
  const MAKKAH_LAT = 21.4225;
  const MAKKAH_LNG = 39.8262;

  const lat1 = (latitude * Math.PI) / 180;
  const lat2 = (MAKKAH_LAT * Math.PI) / 180;
  const lng1 = (longitude * Math.PI) / 180;
  const lng2 = (MAKKAH_LNG * Math.PI) / 180;

  const dLng = lng2 - lng1;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * Check if a prayer time has passed
 */
export function isPrayerPast(prayerTime: Date): boolean {
  return prayerTime < new Date();
}

/**
 * Get prayer status: 'past', 'current', or 'upcoming'
 */
export function getPrayerStatus(
  prayerName: string,
  prayerTimes: PrayerTimesResult
): 'past' | 'current' | 'upcoming' {
  const currentPrayer = getCurrentPrayer(prayerTimes);
  const nextPrayer = getNextPrayer(prayerTimes);

  if (currentPrayer === prayerName) {
    return 'current';
  }

  const prayerTime = prayerTimes[prayerName.toLowerCase() as keyof PrayerTimesResult] as Date;
  if (isPrayerPast(prayerTime)) {
    return 'past';
  }

  return 'upcoming';
}
