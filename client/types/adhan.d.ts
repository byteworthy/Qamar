declare module "adhan" {
  export class Coordinates {
    constructor(latitude: number, longitude: number);
    latitude: number;
    longitude: number;
  }

  export class CalculationMethod {
    static MuslimWorldLeague(): CalculationParameters;
    static Egyptian(): CalculationParameters;
    static Karachi(): CalculationParameters;
    static UmmAlQura(): CalculationParameters;
    static Dubai(): CalculationParameters;
    static MoonsightingCommittee(): CalculationParameters;
    static NorthAmerica(): CalculationParameters;
    static Kuwait(): CalculationParameters;
    static Qatar(): CalculationParameters;
    static Singapore(): CalculationParameters;
    static Tehran(): CalculationParameters;
    static Turkey(): CalculationParameters;
    static Other(): CalculationParameters;
  }

  export interface CalculationParameters {
    method: string;
    fajrAngle: number;
    ishaAngle: number;
    ishaInterval: number;
    madhab: Madhab;
    highLatitudeRule: any;
    adjustments: any;
  }

  export enum Madhab {
    Shafi = "shafi",
    Hanafi = "hanafi",
  }

  export enum Prayer {
    Fajr = "fajr",
    Sunrise = "sunrise",
    Dhuhr = "dhuhr",
    Asr = "asr",
    Maghrib = "maghrib",
    Isha = "isha",
    None = "none",
  }

  export class PrayerTimes {
    constructor(
      coordinates: Coordinates,
      date: Date,
      params: CalculationParameters
    );
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
    currentPrayer(): Prayer;
    nextPrayer(): Prayer;
    timeForPrayer(prayer: Prayer): Date;
  }
}
