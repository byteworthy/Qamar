/**
 * Seed Quran Metadata
 *
 * Populates the quran_metadata table with all 114 surahs.
 * Data sourced from authentic Islamic references.
 *
 * Usage:
 *   npm run seed:quran
 */

import { db } from '../db';
import { quranMetadata } from '@shared/schema';
import { defaultLogger } from '../utils/logger';

/**
 * Complete list of all 114 Surahs with metadata
 * Source: Quran.com, tanzil.net, and other authenticated Islamic databases
 */
const SURAHS = [
  { surahNumber: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatihah', versesCount: 7, revelationPlace: 'Makkah', orderInRevelation: 5 },
  { surahNumber: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', versesCount: 286, revelationPlace: 'Madinah', orderInRevelation: 87 },
  { surahNumber: 3, nameArabic: 'آل عمران', nameEnglish: 'Ali Imran', versesCount: 200, revelationPlace: 'Madinah', orderInRevelation: 89 },
  { surahNumber: 4, nameArabic: 'النساء', nameEnglish: 'An-Nisa', versesCount: 176, revelationPlace: 'Madinah', orderInRevelation: 92 },
  { surahNumber: 5, nameArabic: 'المائدة', nameEnglish: 'Al-Maidah', versesCount: 120, revelationPlace: 'Madinah', orderInRevelation: 112 },
  { surahNumber: 6, nameArabic: 'الأنعام', nameEnglish: 'Al-Anam', versesCount: 165, revelationPlace: 'Makkah', orderInRevelation: 55 },
  { surahNumber: 7, nameArabic: 'الأعراف', nameEnglish: 'Al-Araf', versesCount: 206, revelationPlace: 'Makkah', orderInRevelation: 39 },
  { surahNumber: 8, nameArabic: 'الأنفال', nameEnglish: 'Al-Anfal', versesCount: 75, revelationPlace: 'Madinah', orderInRevelation: 88 },
  { surahNumber: 9, nameArabic: 'التوبة', nameEnglish: 'At-Tawbah', versesCount: 129, revelationPlace: 'Madinah', orderInRevelation: 113 },
  { surahNumber: 10, nameArabic: 'يونس', nameEnglish: 'Yunus', versesCount: 109, revelationPlace: 'Makkah', orderInRevelation: 51 },
  { surahNumber: 11, nameArabic: 'هود', nameEnglish: 'Hud', versesCount: 123, revelationPlace: 'Makkah', orderInRevelation: 52 },
  { surahNumber: 12, nameArabic: 'يوسف', nameEnglish: 'Yusuf', versesCount: 111, revelationPlace: 'Makkah', orderInRevelation: 53 },
  { surahNumber: 13, nameArabic: 'الرعد', nameEnglish: 'Ar-Rad', versesCount: 43, revelationPlace: 'Madinah', orderInRevelation: 96 },
  { surahNumber: 14, nameArabic: 'ابراهيم', nameEnglish: 'Ibrahim', versesCount: 52, revelationPlace: 'Makkah', orderInRevelation: 72 },
  { surahNumber: 15, nameArabic: 'الحجر', nameEnglish: 'Al-Hijr', versesCount: 99, revelationPlace: 'Makkah', orderInRevelation: 54 },
  { surahNumber: 16, nameArabic: 'النحل', nameEnglish: 'An-Nahl', versesCount: 128, revelationPlace: 'Makkah', orderInRevelation: 70 },
  { surahNumber: 17, nameArabic: 'الإسراء', nameEnglish: 'Al-Isra', versesCount: 111, revelationPlace: 'Makkah', orderInRevelation: 50 },
  { surahNumber: 18, nameArabic: 'الكهف', nameEnglish: 'Al-Kahf', versesCount: 110, revelationPlace: 'Makkah', orderInRevelation: 69 },
  { surahNumber: 19, nameArabic: 'مريم', nameEnglish: 'Maryam', versesCount: 98, revelationPlace: 'Makkah', orderInRevelation: 44 },
  { surahNumber: 20, nameArabic: 'طه', nameEnglish: 'Taha', versesCount: 135, revelationPlace: 'Makkah', orderInRevelation: 45 },
  { surahNumber: 21, nameArabic: 'الأنبياء', nameEnglish: 'Al-Anbiya', versesCount: 112, revelationPlace: 'Makkah', orderInRevelation: 73 },
  { surahNumber: 22, nameArabic: 'الحج', nameEnglish: 'Al-Hajj', versesCount: 78, revelationPlace: 'Madinah', orderInRevelation: 103 },
  { surahNumber: 23, nameArabic: 'المؤمنون', nameEnglish: 'Al-Muminun', versesCount: 118, revelationPlace: 'Makkah', orderInRevelation: 74 },
  { surahNumber: 24, nameArabic: 'النور', nameEnglish: 'An-Nur', versesCount: 64, revelationPlace: 'Madinah', orderInRevelation: 102 },
  { surahNumber: 25, nameArabic: 'الفرقان', nameEnglish: 'Al-Furqan', versesCount: 77, revelationPlace: 'Makkah', orderInRevelation: 42 },
  { surahNumber: 26, nameArabic: 'الشعراء', nameEnglish: 'Ash-Shuara', versesCount: 227, revelationPlace: 'Makkah', orderInRevelation: 47 },
  { surahNumber: 27, nameArabic: 'النمل', nameEnglish: 'An-Naml', versesCount: 93, revelationPlace: 'Makkah', orderInRevelation: 48 },
  { surahNumber: 28, nameArabic: 'القصص', nameEnglish: 'Al-Qasas', versesCount: 88, revelationPlace: 'Makkah', orderInRevelation: 49 },
  { surahNumber: 29, nameArabic: 'العنكبوت', nameEnglish: 'Al-Ankabut', versesCount: 69, revelationPlace: 'Makkah', orderInRevelation: 85 },
  { surahNumber: 30, nameArabic: 'الروم', nameEnglish: 'Ar-Rum', versesCount: 60, revelationPlace: 'Makkah', orderInRevelation: 84 },
  { surahNumber: 31, nameArabic: 'لقمان', nameEnglish: 'Luqman', versesCount: 34, revelationPlace: 'Makkah', orderInRevelation: 57 },
  { surahNumber: 32, nameArabic: 'السجدة', nameEnglish: 'As-Sajdah', versesCount: 30, revelationPlace: 'Makkah', orderInRevelation: 75 },
  { surahNumber: 33, nameArabic: 'الأحزاب', nameEnglish: 'Al-Ahzab', versesCount: 73, revelationPlace: 'Madinah', orderInRevelation: 90 },
  { surahNumber: 34, nameArabic: 'سبأ', nameEnglish: 'Saba', versesCount: 54, revelationPlace: 'Makkah', orderInRevelation: 58 },
  { surahNumber: 35, nameArabic: 'فاطر', nameEnglish: 'Fatir', versesCount: 45, revelationPlace: 'Makkah', orderInRevelation: 43 },
  { surahNumber: 36, nameArabic: 'يس', nameEnglish: 'Ya-Sin', versesCount: 83, revelationPlace: 'Makkah', orderInRevelation: 41 },
  { surahNumber: 37, nameArabic: 'الصافات', nameEnglish: 'As-Saffat', versesCount: 182, revelationPlace: 'Makkah', orderInRevelation: 56 },
  { surahNumber: 38, nameArabic: 'ص', nameEnglish: 'Sad', versesCount: 88, revelationPlace: 'Makkah', orderInRevelation: 38 },
  { surahNumber: 39, nameArabic: 'الزمر', nameEnglish: 'Az-Zumar', versesCount: 75, revelationPlace: 'Makkah', orderInRevelation: 59 },
  { surahNumber: 40, nameArabic: 'غافر', nameEnglish: 'Ghafir', versesCount: 85, revelationPlace: 'Makkah', orderInRevelation: 60 },
  { surahNumber: 41, nameArabic: 'فصلت', nameEnglish: 'Fussilat', versesCount: 54, revelationPlace: 'Makkah', orderInRevelation: 61 },
  { surahNumber: 42, nameArabic: 'الشورى', nameEnglish: 'Ash-Shura', versesCount: 53, revelationPlace: 'Makkah', orderInRevelation: 62 },
  { surahNumber: 43, nameArabic: 'الزخرف', nameEnglish: 'Az-Zukhruf', versesCount: 89, revelationPlace: 'Makkah', orderInRevelation: 63 },
  { surahNumber: 44, nameArabic: 'الدخان', nameEnglish: 'Ad-Dukhan', versesCount: 59, revelationPlace: 'Makkah', orderInRevelation: 64 },
  { surahNumber: 45, nameArabic: 'الجاثية', nameEnglish: 'Al-Jathiyah', versesCount: 37, revelationPlace: 'Makkah', orderInRevelation: 65 },
  { surahNumber: 46, nameArabic: 'الأحقاف', nameEnglish: 'Al-Ahqaf', versesCount: 35, revelationPlace: 'Makkah', orderInRevelation: 66 },
  { surahNumber: 47, nameArabic: 'محمد', nameEnglish: 'Muhammad', versesCount: 38, revelationPlace: 'Madinah', orderInRevelation: 95 },
  { surahNumber: 48, nameArabic: 'الفتح', nameEnglish: 'Al-Fath', versesCount: 29, revelationPlace: 'Madinah', orderInRevelation: 111 },
  { surahNumber: 49, nameArabic: 'الحجرات', nameEnglish: 'Al-Hujurat', versesCount: 18, revelationPlace: 'Madinah', orderInRevelation: 106 },
  { surahNumber: 50, nameArabic: 'ق', nameEnglish: 'Qaf', versesCount: 45, revelationPlace: 'Makkah', orderInRevelation: 34 },
  { surahNumber: 51, nameArabic: 'الذاريات', nameEnglish: 'Adh-Dhariyat', versesCount: 60, revelationPlace: 'Makkah', orderInRevelation: 67 },
  { surahNumber: 52, nameArabic: 'الطور', nameEnglish: 'At-Tur', versesCount: 49, revelationPlace: 'Makkah', orderInRevelation: 76 },
  { surahNumber: 53, nameArabic: 'النجم', nameEnglish: 'An-Najm', versesCount: 62, revelationPlace: 'Makkah', orderInRevelation: 23 },
  { surahNumber: 54, nameArabic: 'القمر', nameEnglish: 'Al-Qamar', versesCount: 55, revelationPlace: 'Makkah', orderInRevelation: 37 },
  { surahNumber: 55, nameArabic: 'الرحمن', nameEnglish: 'Ar-Rahman', versesCount: 78, revelationPlace: 'Madinah', orderInRevelation: 97 },
  { surahNumber: 56, nameArabic: 'الواقعة', nameEnglish: 'Al-Waqiah', versesCount: 96, revelationPlace: 'Makkah', orderInRevelation: 46 },
  { surahNumber: 57, nameArabic: 'الحديد', nameEnglish: 'Al-Hadid', versesCount: 29, revelationPlace: 'Madinah', orderInRevelation: 94 },
  { surahNumber: 58, nameArabic: 'المجادلة', nameEnglish: 'Al-Mujadilah', versesCount: 22, revelationPlace: 'Madinah', orderInRevelation: 105 },
  { surahNumber: 59, nameArabic: 'الحشر', nameEnglish: 'Al-Hashr', versesCount: 24, revelationPlace: 'Madinah', orderInRevelation: 101 },
  { surahNumber: 60, nameArabic: 'الممتحنة', nameEnglish: 'Al-Mumtahanah', versesCount: 13, revelationPlace: 'Madinah', orderInRevelation: 91 },
  { surahNumber: 61, nameArabic: 'الصف', nameEnglish: 'As-Saf', versesCount: 14, revelationPlace: 'Madinah', orderInRevelation: 109 },
  { surahNumber: 62, nameArabic: 'الجمعة', nameEnglish: 'Al-Jumuah', versesCount: 11, revelationPlace: 'Madinah', orderInRevelation: 110 },
  { surahNumber: 63, nameArabic: 'المنافقون', nameEnglish: 'Al-Munafiqun', versesCount: 11, revelationPlace: 'Madinah', orderInRevelation: 104 },
  { surahNumber: 64, nameArabic: 'التغابن', nameEnglish: 'At-Taghabun', versesCount: 18, revelationPlace: 'Madinah', orderInRevelation: 108 },
  { surahNumber: 65, nameArabic: 'الطلاق', nameEnglish: 'At-Talaq', versesCount: 12, revelationPlace: 'Madinah', orderInRevelation: 99 },
  { surahNumber: 66, nameArabic: 'التحريم', nameEnglish: 'At-Tahrim', versesCount: 12, revelationPlace: 'Madinah', orderInRevelation: 107 },
  { surahNumber: 67, nameArabic: 'الملك', nameEnglish: 'Al-Mulk', versesCount: 30, revelationPlace: 'Makkah', orderInRevelation: 77 },
  { surahNumber: 68, nameArabic: 'القلم', nameEnglish: 'Al-Qalam', versesCount: 52, revelationPlace: 'Makkah', orderInRevelation: 2 },
  { surahNumber: 69, nameArabic: 'الحاقة', nameEnglish: 'Al-Haqqah', versesCount: 52, revelationPlace: 'Makkah', orderInRevelation: 78 },
  { surahNumber: 70, nameArabic: 'المعارج', nameEnglish: 'Al-Maarij', versesCount: 44, revelationPlace: 'Makkah', orderInRevelation: 79 },
  { surahNumber: 71, nameArabic: 'نوح', nameEnglish: 'Nuh', versesCount: 28, revelationPlace: 'Makkah', orderInRevelation: 71 },
  { surahNumber: 72, nameArabic: 'الجن', nameEnglish: 'Al-Jinn', versesCount: 28, revelationPlace: 'Makkah', orderInRevelation: 40 },
  { surahNumber: 73, nameArabic: 'المزمل', nameEnglish: 'Al-Muzzammil', versesCount: 20, revelationPlace: 'Makkah', orderInRevelation: 3 },
  { surahNumber: 74, nameArabic: 'المدثر', nameEnglish: 'Al-Muddaththir', versesCount: 56, revelationPlace: 'Makkah', orderInRevelation: 4 },
  { surahNumber: 75, nameArabic: 'القيامة', nameEnglish: 'Al-Qiyamah', versesCount: 40, revelationPlace: 'Makkah', orderInRevelation: 31 },
  { surahNumber: 76, nameArabic: 'الانسان', nameEnglish: 'Al-Insan', versesCount: 31, revelationPlace: 'Madinah', orderInRevelation: 98 },
  { surahNumber: 77, nameArabic: 'المرسلات', nameEnglish: 'Al-Mursalat', versesCount: 50, revelationPlace: 'Makkah', orderInRevelation: 33 },
  { surahNumber: 78, nameArabic: 'النبأ', nameEnglish: 'An-Naba', versesCount: 40, revelationPlace: 'Makkah', orderInRevelation: 80 },
  { surahNumber: 79, nameArabic: 'النازعات', nameEnglish: 'An-Naziat', versesCount: 46, revelationPlace: 'Makkah', orderInRevelation: 81 },
  { surahNumber: 80, nameArabic: 'عبس', nameEnglish: 'Abasa', versesCount: 42, revelationPlace: 'Makkah', orderInRevelation: 24 },
  { surahNumber: 81, nameArabic: 'التكوير', nameEnglish: 'At-Takwir', versesCount: 29, revelationPlace: 'Makkah', orderInRevelation: 7 },
  { surahNumber: 82, nameArabic: 'الإنفطار', nameEnglish: 'Al-Infitar', versesCount: 19, revelationPlace: 'Makkah', orderInRevelation: 82 },
  { surahNumber: 83, nameArabic: 'المطففين', nameEnglish: 'Al-Mutaffifin', versesCount: 36, revelationPlace: 'Makkah', orderInRevelation: 86 },
  { surahNumber: 84, nameArabic: 'الإنشقاق', nameEnglish: 'Al-Inshiqaq', versesCount: 25, revelationPlace: 'Makkah', orderInRevelation: 83 },
  { surahNumber: 85, nameArabic: 'البروج', nameEnglish: 'Al-Buruj', versesCount: 22, revelationPlace: 'Makkah', orderInRevelation: 27 },
  { surahNumber: 86, nameArabic: 'الطارق', nameEnglish: 'At-Tariq', versesCount: 17, revelationPlace: 'Makkah', orderInRevelation: 36 },
  { surahNumber: 87, nameArabic: 'الأعلى', nameEnglish: 'Al-Ala', versesCount: 19, revelationPlace: 'Makkah', orderInRevelation: 8 },
  { surahNumber: 88, nameArabic: 'الغاشية', nameEnglish: 'Al-Ghashiyah', versesCount: 26, revelationPlace: 'Makkah', orderInRevelation: 68 },
  { surahNumber: 89, nameArabic: 'الفجر', nameEnglish: 'Al-Fajr', versesCount: 30, revelationPlace: 'Makkah', orderInRevelation: 10 },
  { surahNumber: 90, nameArabic: 'البلد', nameEnglish: 'Al-Balad', versesCount: 20, revelationPlace: 'Makkah', orderInRevelation: 35 },
  { surahNumber: 91, nameArabic: 'الشمس', nameEnglish: 'Ash-Shams', versesCount: 15, revelationPlace: 'Makkah', orderInRevelation: 26 },
  { surahNumber: 92, nameArabic: 'الليل', nameEnglish: 'Al-Layl', versesCount: 21, revelationPlace: 'Makkah', orderInRevelation: 9 },
  { surahNumber: 93, nameArabic: 'الضحى', nameEnglish: 'Ad-Duha', versesCount: 11, revelationPlace: 'Makkah', orderInRevelation: 11 },
  { surahNumber: 94, nameArabic: 'الشرح', nameEnglish: 'Ash-Sharh', versesCount: 8, revelationPlace: 'Makkah', orderInRevelation: 12 },
  { surahNumber: 95, nameArabic: 'التين', nameEnglish: 'At-Tin', versesCount: 8, revelationPlace: 'Makkah', orderInRevelation: 28 },
  { surahNumber: 96, nameArabic: 'العلق', nameEnglish: 'Al-Alaq', versesCount: 19, revelationPlace: 'Makkah', orderInRevelation: 1 },
  { surahNumber: 97, nameArabic: 'القدر', nameEnglish: 'Al-Qadr', versesCount: 5, revelationPlace: 'Makkah', orderInRevelation: 25 },
  { surahNumber: 98, nameArabic: 'البينة', nameEnglish: 'Al-Bayyinah', versesCount: 8, revelationPlace: 'Madinah', orderInRevelation: 100 },
  { surahNumber: 99, nameArabic: 'الزلزلة', nameEnglish: 'Az-Zalzalah', versesCount: 8, revelationPlace: 'Madinah', orderInRevelation: 93 },
  { surahNumber: 100, nameArabic: 'العاديات', nameEnglish: 'Al-Adiyat', versesCount: 11, revelationPlace: 'Makkah', orderInRevelation: 14 },
  { surahNumber: 101, nameArabic: 'القارعة', nameEnglish: 'Al-Qariah', versesCount: 11, revelationPlace: 'Makkah', orderInRevelation: 30 },
  { surahNumber: 102, nameArabic: 'التكاثر', nameEnglish: 'At-Takathur', versesCount: 8, revelationPlace: 'Makkah', orderInRevelation: 16 },
  { surahNumber: 103, nameArabic: 'العصر', nameEnglish: 'Al-Asr', versesCount: 3, revelationPlace: 'Makkah', orderInRevelation: 13 },
  { surahNumber: 104, nameArabic: 'الهمزة', nameEnglish: 'Al-Humazah', versesCount: 9, revelationPlace: 'Makkah', orderInRevelation: 32 },
  { surahNumber: 105, nameArabic: 'الفيل', nameEnglish: 'Al-Fil', versesCount: 5, revelationPlace: 'Makkah', orderInRevelation: 19 },
  { surahNumber: 106, nameArabic: 'قريش', nameEnglish: 'Quraysh', versesCount: 4, revelationPlace: 'Makkah', orderInRevelation: 29 },
  { surahNumber: 107, nameArabic: 'الماعون', nameEnglish: 'Al-Maun', versesCount: 7, revelationPlace: 'Makkah', orderInRevelation: 17 },
  { surahNumber: 108, nameArabic: 'الكوثر', nameEnglish: 'Al-Kawthar', versesCount: 3, revelationPlace: 'Makkah', orderInRevelation: 15 },
  { surahNumber: 109, nameArabic: 'الكافرون', nameEnglish: 'Al-Kafirun', versesCount: 6, revelationPlace: 'Makkah', orderInRevelation: 18 },
  { surahNumber: 110, nameArabic: 'النصر', nameEnglish: 'An-Nasr', versesCount: 3, revelationPlace: 'Madinah', orderInRevelation: 114 },
  { surahNumber: 111, nameArabic: 'المسد', nameEnglish: 'Al-Masad', versesCount: 5, revelationPlace: 'Makkah', orderInRevelation: 6 },
  { surahNumber: 112, nameArabic: 'الإخلاص', nameEnglish: 'Al-Ikhlas', versesCount: 4, revelationPlace: 'Makkah', orderInRevelation: 22 },
  { surahNumber: 113, nameArabic: 'الفلق', nameEnglish: 'Al-Falaq', versesCount: 5, revelationPlace: 'Makkah', orderInRevelation: 20 },
  { surahNumber: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', versesCount: 6, revelationPlace: 'Makkah', orderInRevelation: 21 },
];

async function seedQuranMetadata() {
  try {
    defaultLogger.info('Starting Quran metadata seed...');

    // Insert all surahs (on conflict do nothing for idempotency)
    await db.insert(quranMetadata).values(SURAHS).onConflictDoNothing();

    defaultLogger.info('Quran metadata seed complete', {
      totalSurahs: SURAHS.length,
    });

    process.exit(0);
  } catch (error) {
    defaultLogger.error(
      'Error seeding Quran metadata',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

// Run seed
seedQuranMetadata();
