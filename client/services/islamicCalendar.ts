/**
 * Islamic (Hijri) Calendar Service
 *
 * Uses the Tabular Islamic Calendar algorithm for Gregorian-to-Hijri conversion.
 * Reference: https://en.wikipedia.org/wiki/Tabular_Islamic_calendar
 *
 * No external API required - all calculations done client-side.
 */

// --------------------------------------------------------------------------
// Month names
// --------------------------------------------------------------------------

const HIJRI_MONTHS_ENGLISH = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Ula",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul Qi'dah",
  "Dhul Hijjah",
] as const;

const HIJRI_MONTHS_ARABIC = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
] as const;

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface HijriDate {
  day: number;
  month: string;
  monthNumber: number;
  year: number;
  monthArabic: string;
}

export interface IslamicEvent {
  name: string;
  nameArabic: string;
  month: number; // 1-12 Hijri month
  day: number;
  description: string;
}

// --------------------------------------------------------------------------
// Notable Islamic events by Hijri month and day
// --------------------------------------------------------------------------

const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    name: "Islamic New Year",
    nameArabic: "رأس السنة الهجرية",
    month: 1,
    day: 1,
    description: "Beginning of the new Hijri year",
  },
  {
    name: "Day of Ashura",
    nameArabic: "يوم عاشوراء",
    month: 1,
    day: 10,
    description: "Commemorated with fasting; the day Allah saved Musa (AS)",
  },
  {
    name: "Mawlid an-Nabi",
    nameArabic: "المولد النبوي",
    month: 3,
    day: 12,
    description: "Birth of Prophet Muhammad (PBUH)",
  },
  {
    name: "Isra and Mi'raj",
    nameArabic: "الإسراء والمعراج",
    month: 7,
    day: 27,
    description: "The Night Journey and Ascension of the Prophet (PBUH)",
  },
  {
    name: "Sha'ban Mid-Night",
    nameArabic: "ليلة النصف من شعبان",
    month: 8,
    day: 15,
    description: "Night of forgiveness and blessings",
  },
  {
    name: "Start of Ramadan",
    nameArabic: "بداية رمضان",
    month: 9,
    day: 1,
    description: "Beginning of the month of fasting",
  },
  {
    name: "Laylat al-Qadr (approx.)",
    nameArabic: "ليلة القدر",
    month: 9,
    day: 27,
    description: "The Night of Decree, better than a thousand months",
  },
  {
    name: "Eid al-Fitr",
    nameArabic: "عيد الفطر",
    month: 10,
    day: 1,
    description: "Festival of Breaking the Fast",
  },
  {
    name: "Day of Arafah",
    nameArabic: "يوم عرفة",
    month: 12,
    day: 9,
    description:
      "Standing at Arafah during Hajj; fasting expiates two years of sins",
  },
  {
    name: "Eid al-Adha",
    nameArabic: "عيد الأضحى",
    month: 12,
    day: 10,
    description: "Festival of the Sacrifice",
  },
];

// --------------------------------------------------------------------------
// Tabular Islamic Calendar algorithm
// --------------------------------------------------------------------------

/**
 * Convert a Gregorian date to a Hijri date using the Tabular Islamic Calendar.
 *
 * The algorithm converts to Julian Day Number first, then to Hijri.
 * Accuracy: +/- 1-2 days (tabular approximation).
 */
export function getHijriDate(date: Date = new Date()): HijriDate {
  // Step 1: Gregorian to Julian Day Number (JDN)
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1-based
  const d = date.getDate();

  // Gregorian to JDN formula
  const a = Math.floor((14 - m) / 12);
  const yAdj = y + 4800 - a;
  const mAdj = m + 12 * a - 3;

  const jdn =
    d +
    Math.floor((153 * mAdj + 2) / 5) +
    365 * yAdj +
    Math.floor(yAdj / 4) -
    Math.floor(yAdj / 100) +
    Math.floor(yAdj / 400) -
    32045;

  // Step 2: JDN to Hijri (Tabular Islamic Calendar, civil/Thursday epoch)
  // Epoch: July 16, 622 CE (Julian) = JDN 1948439.5, using 1948440 for integer math
  const epochJdn = 1948440;
  const l = jdn - epochJdn + 10632;
  const n = Math.floor((l - 1) / 10631);
  const lRem = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - lRem) / 5316) * Math.floor((50 * lRem) / 17719) +
    Math.floor(lRem / 5670) * Math.floor((43 * lRem) / 15238);
  const lFinal =
    lRem -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hijriMonth = Math.floor((24 * lFinal) / 709);
  const hijriDay = lFinal - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const monthIndex = Math.max(0, Math.min(11, hijriMonth - 1));

  return {
    day: hijriDay,
    month: HIJRI_MONTHS_ENGLISH[monthIndex],
    monthNumber: hijriMonth,
    year: hijriYear,
    monthArabic: HIJRI_MONTHS_ARABIC[monthIndex],
  };
}

/**
 * Format a Hijri date as a readable string.
 * e.g. "15 Ramadan 1447 AH"
 */
export function formatHijriDate(hijri: HijriDate): string {
  return `${hijri.day} ${hijri.month} ${hijri.year} AH`;
}

/**
 * Format a Hijri date in Arabic.
 * e.g. "١٥ رمضان ١٤٤٧ هـ"
 */
export function formatHijriDateArabic(hijri: HijriDate): string {
  const arabicDigits = (n: number) =>
    String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
  return `${arabicDigits(hijri.day)} ${hijri.monthArabic} ${arabicDigits(hijri.year)} هـ`;
}

/**
 * Get Islamic events/occasions happening today (or on a given date).
 * Returns events whose Hijri month and day match.
 */
export function getTodayEvents(date: Date = new Date()): IslamicEvent[] {
  const hijri = getHijriDate(date);
  return ISLAMIC_EVENTS.filter(
    (e) => e.month === hijri.monthNumber && e.day === hijri.day,
  );
}

/**
 * Get upcoming Islamic events within the next N days (default 30).
 */
export function getUpcomingEvents(
  daysAhead: number = 30,
  from: Date = new Date(),
): (IslamicEvent & { hijriDate: HijriDate; daysUntil: number })[] {
  const results: (IslamicEvent & {
    hijriDate: HijriDate;
    daysUntil: number;
  })[] = [];

  for (let i = 0; i <= daysAhead; i++) {
    const checkDate = new Date(from);
    checkDate.setDate(checkDate.getDate() + i);
    const hijri = getHijriDate(checkDate);
    const dayEvents = ISLAMIC_EVENTS.filter(
      (e) => e.month === hijri.monthNumber && e.day === hijri.day,
    );
    for (const event of dayEvents) {
      results.push({ ...event, hijriDate: hijri, daysUntil: i });
    }
  }

  return results;
}

/**
 * Get all Hijri month names (English and Arabic).
 */
export function getHijriMonths(): {
  english: string;
  arabic: string;
  number: number;
}[] {
  return HIJRI_MONTHS_ENGLISH.map((en, i) => ({
    english: en,
    arabic: HIJRI_MONTHS_ARABIC[i],
    number: i + 1,
  }));
}
