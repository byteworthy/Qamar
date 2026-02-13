/**
 * Seed Vocabulary Words
 *
 * Populates the vocabulary_words table with comprehensive Arabic vocabulary.
 * Data extracted from client-side vocabulary and expanded with authentic Arabic words.
 *
 * Categories:
 * - greetings (18 words)
 * - prayer (25 words)
 * - family (18 words)
 * - food (20 words)
 * - nature (18 words)
 * - numbers (15 words)
 * - daily_life (20 words)
 * - islamic_terms (28 words)
 * - alphabet (28 letters)
 *
 * Total: 190 vocabulary items
 *
 * Usage:
 *   npm run seed:vocabulary
 */

import { db } from '../db';
import { vocabularyWords } from '@shared/schema';
import { defaultLogger } from '../utils/logger';

interface VocabularyEntry {
  arabic: string;
  english: string;
  transliteration: string;
  category: string;
  difficulty: number;
}

/**
 * Complete vocabulary dataset with 190+ Arabic words and letters
 */
const VOCABULARY: VocabularyEntry[] = [
  // ============================================================================
  // GREETINGS (18 words)
  // ============================================================================
  {
    arabic: 'السلام عليكم',
    transliteration: 'As-salamu alaykum',
    english: 'Peace be upon you',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'وعليكم السلام',
    transliteration: 'Wa alaykum as-salam',
    english: 'And upon you peace',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'مرحبا',
    transliteration: 'Marhaba',
    english: 'Hello',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'أهلا',
    transliteration: 'Ahlan',
    english: 'Welcome',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'صباح الخير',
    transliteration: 'Sabah al-khayr',
    english: 'Good morning',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'مساء الخير',
    transliteration: 'Masa al-khayr',
    english: 'Good evening',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'تصبح على خير',
    transliteration: 'Tusbih ala khayr',
    english: 'Good night',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'شكرا',
    transliteration: 'Shukran',
    english: 'Thank you',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'من فضلك',
    transliteration: 'Min fadlik',
    english: 'Please',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'عفوا',
    transliteration: 'Afwan',
    english: 'You are welcome',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'كيف حالك',
    transliteration: 'Kayfa haluk',
    english: 'How are you',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'الحمد لله',
    transliteration: 'Alhamdulillah',
    english: 'Praise be to God',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'ما شاء الله',
    transliteration: 'Masha Allah',
    english: 'As God willed',
    category: 'greetings',
    difficulty: 2,
  },
  {
    arabic: 'بارك الله فيك',
    transliteration: 'Baraka Allahu fik',
    english: 'May God bless you',
    category: 'greetings',
    difficulty: 2,
  },
  {
    arabic: 'مع السلامة',
    transliteration: 'Maa salama',
    english: 'Goodbye',
    category: 'greetings',
    difficulty: 1,
  },
  {
    arabic: 'في أمان الله',
    transliteration: 'Fi aman Allah',
    english: 'In God\'s protection',
    category: 'greetings',
    difficulty: 2,
  },
  {
    arabic: 'جزاك الله خيرا',
    transliteration: 'Jazaka Allahu khayran',
    english: 'May God reward you with goodness',
    category: 'greetings',
    difficulty: 2,
  },
  {
    arabic: 'آمين',
    transliteration: 'Ameen',
    english: 'Amen',
    category: 'greetings',
    difficulty: 1,
  },

  // ============================================================================
  // PRAYER (25 words)
  // ============================================================================
  {
    arabic: 'صلاة',
    transliteration: 'Salah',
    english: 'Prayer',
    category: 'prayer',
    difficulty: 1,
  },
  {
    arabic: 'مسجد',
    transliteration: 'Masjid',
    english: 'Mosque',
    category: 'prayer',
    difficulty: 1,
  },
  {
    arabic: 'قرآن',
    transliteration: 'Quran',
    english: 'Quran',
    category: 'prayer',
    difficulty: 1,
  },
  {
    arabic: 'الله',
    transliteration: 'Allah',
    english: 'God',
    category: 'prayer',
    difficulty: 1,
  },
  {
    arabic: 'دعاء',
    transliteration: 'Dua',
    english: 'Supplication',
    category: 'prayer',
    difficulty: 1,
  },
  {
    arabic: 'ركعة',
    transliteration: 'Rakah',
    english: 'Prayer unit',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'وضوء',
    transliteration: 'Wudu',
    english: 'Ablution',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'سجدة',
    transliteration: 'Sajdah',
    english: 'Prostration',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'ركوع',
    transliteration: 'Ruku',
    english: 'Bowing',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'قيام',
    transliteration: 'Qiyam',
    english: 'Standing',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'تسبيح',
    transliteration: 'Tasbih',
    english: 'Glorification',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'تكبير',
    transliteration: 'Takbir',
    english: 'Saying Allahu Akbar',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'تشهد',
    transliteration: 'Tashahhud',
    english: 'Testimony of faith in prayer',
    category: 'prayer',
    difficulty: 3,
  },
  {
    arabic: 'إمام',
    transliteration: 'Imam',
    english: 'Prayer leader',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'محراب',
    transliteration: 'Mihrab',
    english: 'Prayer niche',
    category: 'prayer',
    difficulty: 3,
  },
  {
    arabic: 'مئذنة',
    transliteration: 'Midhanah',
    english: 'Minaret',
    category: 'prayer',
    difficulty: 3,
  },
  {
    arabic: 'أذان',
    transliteration: 'Adhan',
    english: 'Call to prayer',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'إقامة',
    transliteration: 'Iqamah',
    english: 'Second call to prayer',
    category: 'prayer',
    difficulty: 3,
  },
  {
    arabic: 'قبلة',
    transliteration: 'Qiblah',
    english: 'Direction of prayer',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'سجادة',
    transliteration: 'Sajjadah',
    english: 'Prayer mat',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'مصحف',
    transliteration: 'Mushaf',
    english: 'Copy of Quran',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'تلاوة',
    transliteration: 'Tilawah',
    english: 'Recitation',
    category: 'prayer',
    difficulty: 3,
  },
  {
    arabic: 'فجر',
    transliteration: 'Fajr',
    english: 'Dawn prayer',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'ظهر',
    transliteration: 'Dhuhr',
    english: 'Noon prayer',
    category: 'prayer',
    difficulty: 2,
  },
  {
    arabic: 'عصر',
    transliteration: 'Asr',
    english: 'Afternoon prayer',
    category: 'prayer',
    difficulty: 2,
  },

  // ============================================================================
  // FAMILY (18 words)
  // ============================================================================
  {
    arabic: 'أب',
    transliteration: 'Ab',
    english: 'Father',
    category: 'family',
    difficulty: 1,
  },
  {
    arabic: 'أم',
    transliteration: 'Umm',
    english: 'Mother',
    category: 'family',
    difficulty: 1,
  },
  {
    arabic: 'أخ',
    transliteration: 'Akh',
    english: 'Brother',
    category: 'family',
    difficulty: 1,
  },
  {
    arabic: 'أخت',
    transliteration: 'Ukht',
    english: 'Sister',
    category: 'family',
    difficulty: 1,
  },
  {
    arabic: 'ابن',
    transliteration: 'Ibn',
    english: 'Son',
    category: 'family',
    difficulty: 1,
  },
  {
    arabic: 'بنت',
    transliteration: 'Bint',
    english: 'Daughter',
    category: 'family',
    difficulty: 1,
  },
  {
    arabic: 'جد',
    transliteration: 'Jadd',
    english: 'Grandfather',
    category: 'family',
    difficulty: 1,
  },
  {
    arabic: 'جدة',
    transliteration: 'Jaddah',
    english: 'Grandmother',
    category: 'family',
    difficulty: 1,
  },
  {
    arabic: 'عم',
    transliteration: 'Amm',
    english: 'Paternal uncle',
    category: 'family',
    difficulty: 2,
  },
  {
    arabic: 'عمة',
    transliteration: 'Ammah',
    english: 'Paternal aunt',
    category: 'family',
    difficulty: 2,
  },
  {
    arabic: 'خال',
    transliteration: 'Khal',
    english: 'Maternal uncle',
    category: 'family',
    difficulty: 2,
  },
  {
    arabic: 'خالة',
    transliteration: 'Khalah',
    english: 'Maternal aunt',
    category: 'family',
    difficulty: 2,
  },
  {
    arabic: 'زوج',
    transliteration: 'Zawj',
    english: 'Husband',
    category: 'family',
    difficulty: 2,
  },
  {
    arabic: 'زوجة',
    transliteration: 'Zawjah',
    english: 'Wife',
    category: 'family',
    difficulty: 2,
  },
  {
    arabic: 'عائلة',
    transliteration: 'Ailah',
    english: 'Family',
    category: 'family',
    difficulty: 1,
  },
  {
    arabic: 'حفيد',
    transliteration: 'Hafid',
    english: 'Grandson',
    category: 'family',
    difficulty: 2,
  },
  {
    arabic: 'حفيدة',
    transliteration: 'Hafidah',
    english: 'Granddaughter',
    category: 'family',
    difficulty: 2,
  },
  {
    arabic: 'أسرة',
    transliteration: 'Usrah',
    english: 'Household',
    category: 'family',
    difficulty: 2,
  },

  // ============================================================================
  // FOOD (20 words)
  // ============================================================================
  {
    arabic: 'ماء',
    transliteration: 'Maa',
    english: 'Water',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'خبز',
    transliteration: 'Khubz',
    english: 'Bread',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'لحم',
    transliteration: 'Lahm',
    english: 'Meat',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'فاكهة',
    transliteration: 'Fakihah',
    english: 'Fruit',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'حليب',
    transliteration: 'Halib',
    english: 'Milk',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'أرز',
    transliteration: 'Aruzz',
    english: 'Rice',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'تمر',
    transliteration: 'Tamr',
    english: 'Dates',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'شاي',
    transliteration: 'Shay',
    english: 'Tea',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'قهوة',
    transliteration: 'Qahwa',
    english: 'Coffee',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'عسل',
    transliteration: 'Asal',
    english: 'Honey',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'سمك',
    transliteration: 'Samak',
    english: 'Fish',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'دجاج',
    transliteration: 'Dajaj',
    english: 'Chicken',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'خضار',
    transliteration: 'Khudar',
    english: 'Vegetables',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'زيت',
    transliteration: 'Zayt',
    english: 'Oil',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'ملح',
    transliteration: 'Milh',
    english: 'Salt',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'سكر',
    transliteration: 'Sukkar',
    english: 'Sugar',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'لبن',
    transliteration: 'Laban',
    english: 'Yogurt',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'بيض',
    transliteration: 'Bayd',
    english: 'Eggs',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'جبن',
    transliteration: 'Jubn',
    english: 'Cheese',
    category: 'food',
    difficulty: 1,
  },
  {
    arabic: 'طعام',
    transliteration: 'Taam',
    english: 'Food',
    category: 'food',
    difficulty: 1,
  },

  // ============================================================================
  // NATURE (18 words)
  // ============================================================================
  {
    arabic: 'شمس',
    transliteration: 'Shams',
    english: 'Sun',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'قمر',
    transliteration: 'Qamar',
    english: 'Moon',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'نجم',
    transliteration: 'Najm',
    english: 'Star',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'سماء',
    transliteration: 'Samaa',
    english: 'Sky',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'بحر',
    transliteration: 'Bahr',
    english: 'Sea',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'جبل',
    transliteration: 'Jabal',
    english: 'Mountain',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'شجرة',
    transliteration: 'Shajarah',
    english: 'Tree',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'وردة',
    transliteration: 'Wardah',
    english: 'Flower',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'نهر',
    transliteration: 'Nahr',
    english: 'River',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'أرض',
    transliteration: 'Ard',
    english: 'Earth/Land',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'ريح',
    transliteration: 'Rih',
    english: 'Wind',
    category: 'nature',
    difficulty: 2,
  },
  {
    arabic: 'مطر',
    transliteration: 'Matar',
    english: 'Rain',
    category: 'nature',
    difficulty: 1,
  },
  {
    arabic: 'سحاب',
    transliteration: 'Sahab',
    english: 'Cloud',
    category: 'nature',
    difficulty: 2,
  },
  {
    arabic: 'حديقة',
    transliteration: 'Hadiqah',
    english: 'Garden',
    category: 'nature',
    difficulty: 2,
  },
  {
    arabic: 'صحراء',
    transliteration: 'Sahraa',
    english: 'Desert',
    category: 'nature',
    difficulty: 2,
  },
  {
    arabic: 'غابة',
    transliteration: 'Ghabah',
    english: 'Forest',
    category: 'nature',
    difficulty: 2,
  },
  {
    arabic: 'ثلج',
    transliteration: 'Thalj',
    english: 'Snow',
    category: 'nature',
    difficulty: 2,
  },
  {
    arabic: 'نار',
    transliteration: 'Nar',
    english: 'Fire',
    category: 'nature',
    difficulty: 1,
  },

  // ============================================================================
  // NUMBERS (15 words)
  // ============================================================================
  {
    arabic: 'واحد',
    transliteration: 'Wahid',
    english: 'One',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'اثنان',
    transliteration: 'Ithnan',
    english: 'Two',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'ثلاثة',
    transliteration: 'Thalatha',
    english: 'Three',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'أربعة',
    transliteration: 'Arbaa',
    english: 'Four',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'خمسة',
    transliteration: 'Khamsah',
    english: 'Five',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'ستة',
    transliteration: 'Sittah',
    english: 'Six',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'سبعة',
    transliteration: 'Sabah',
    english: 'Seven',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'ثمانية',
    transliteration: 'Thamaniyah',
    english: 'Eight',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'تسعة',
    transliteration: 'Tisah',
    english: 'Nine',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'عشرة',
    transliteration: 'Asharah',
    english: 'Ten',
    category: 'numbers',
    difficulty: 1,
  },
  {
    arabic: 'عشرون',
    transliteration: 'Ishrun',
    english: 'Twenty',
    category: 'numbers',
    difficulty: 2,
  },
  {
    arabic: 'ثلاثون',
    transliteration: 'Thalathun',
    english: 'Thirty',
    category: 'numbers',
    difficulty: 2,
  },
  {
    arabic: 'مائة',
    transliteration: 'Miah',
    english: 'One hundred',
    category: 'numbers',
    difficulty: 2,
  },
  {
    arabic: 'ألف',
    transliteration: 'Alf',
    english: 'One thousand',
    category: 'numbers',
    difficulty: 2,
  },
  {
    arabic: 'صفر',
    transliteration: 'Sifr',
    english: 'Zero',
    category: 'numbers',
    difficulty: 1,
  },

  // ============================================================================
  // DAILY LIFE (20 words)
  // ============================================================================
  {
    arabic: 'كتاب',
    transliteration: 'Kitab',
    english: 'Book',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'قلم',
    transliteration: 'Qalam',
    english: 'Pen',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'بيت',
    transliteration: 'Bayt',
    english: 'House',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'باب',
    transliteration: 'Bab',
    english: 'Door',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'شباك',
    transliteration: 'Shubbak',
    english: 'Window',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'كرسي',
    transliteration: 'Kursi',
    english: 'Chair',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'طاولة',
    transliteration: 'Tawilah',
    english: 'Table',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'طريق',
    transliteration: 'Tariq',
    english: 'Road/Path',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'سيارة',
    transliteration: 'Sayarah',
    english: 'Car',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'مدرسة',
    transliteration: 'Madrasah',
    english: 'School',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'سوق',
    transliteration: 'Suq',
    english: 'Market',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'مكتبة',
    transliteration: 'Maktabah',
    english: 'Library',
    category: 'daily_life',
    difficulty: 2,
  },
  {
    arabic: 'مفتاح',
    transliteration: 'Miftah',
    english: 'Key',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'ساعة',
    transliteration: 'Saah',
    english: 'Clock/Hour',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'هاتف',
    transliteration: 'Hatif',
    english: 'Telephone',
    category: 'daily_life',
    difficulty: 2,
  },
  {
    arabic: 'كمبيوتر',
    transliteration: 'Kambyutar',
    english: 'Computer',
    category: 'daily_life',
    difficulty: 2,
  },
  {
    arabic: 'مستشفى',
    transliteration: 'Mustashfa',
    english: 'Hospital',
    category: 'daily_life',
    difficulty: 2,
  },
  {
    arabic: 'دكان',
    transliteration: 'Dukkan',
    english: 'Shop',
    category: 'daily_life',
    difficulty: 1,
  },
  {
    arabic: 'ملابس',
    transliteration: 'Malabis',
    english: 'Clothes',
    category: 'daily_life',
    difficulty: 2,
  },
  {
    arabic: 'نقود',
    transliteration: 'Nuqud',
    english: 'Money',
    category: 'daily_life',
    difficulty: 2,
  },

  // ============================================================================
  // ISLAMIC TERMS (28 words)
  // ============================================================================
  {
    arabic: 'إسلام',
    transliteration: 'Islam',
    english: 'Islam',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'إيمان',
    transliteration: 'Iman',
    english: 'Faith',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'إحسان',
    transliteration: 'Ihsan',
    english: 'Excellence',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'توبة',
    transliteration: 'Tawbah',
    english: 'Repentance',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'تقوى',
    transliteration: 'Taqwa',
    english: 'God-consciousness',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'صبر',
    transliteration: 'Sabr',
    english: 'Patience',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'شكر',
    transliteration: 'Shukr',
    english: 'Gratitude',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'ذكر',
    transliteration: 'Dhikr',
    english: 'Remembrance of God',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'جنة',
    transliteration: 'Jannah',
    english: 'Paradise',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'نار',
    transliteration: 'Nar',
    english: 'Hellfire',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'حق',
    transliteration: 'Haqq',
    english: 'Truth',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'أمانة',
    transliteration: 'Amanah',
    english: 'Trust/Trustworthiness',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'رحمة',
    transliteration: 'Rahmah',
    english: 'Mercy',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'علم',
    transliteration: 'Ilm',
    english: 'Knowledge',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'حكمة',
    transliteration: 'Hikmah',
    english: 'Wisdom',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'نور',
    transliteration: 'Nur',
    english: 'Light',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'قلب',
    transliteration: 'Qalb',
    english: 'Heart',
    category: 'islamic_terms',
    difficulty: 1,
  },
  {
    arabic: 'نفس',
    transliteration: 'Nafs',
    english: 'Soul/Self',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'روح',
    transliteration: 'Ruh',
    english: 'Spirit',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'زكاة',
    transliteration: 'Zakah',
    english: 'Charity/Alms',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'صوم',
    transliteration: 'Sawm',
    english: 'Fasting',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'حج',
    transliteration: 'Hajj',
    english: 'Pilgrimage',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'شهادة',
    transliteration: 'Shahadah',
    english: 'Testimony of faith',
    category: 'islamic_terms',
    difficulty: 2,
  },
  {
    arabic: 'حديث',
    transliteration: 'Hadith',
    english: 'Prophetic tradition',
    category: 'islamic_terms',
    difficulty: 3,
  },
  {
    arabic: 'سنة',
    transliteration: 'Sunnah',
    english: 'Prophetic practice',
    category: 'islamic_terms',
    difficulty: 3,
  },
  {
    arabic: 'فقه',
    transliteration: 'Fiqh',
    english: 'Islamic jurisprudence',
    category: 'islamic_terms',
    difficulty: 4,
  },
  {
    arabic: 'عقيدة',
    transliteration: 'Aqidah',
    english: 'Islamic creed',
    category: 'islamic_terms',
    difficulty: 4,
  },
  {
    arabic: 'أخلاق',
    transliteration: 'Akhlaq',
    english: 'Moral character',
    category: 'islamic_terms',
    difficulty: 3,
  },

  // ============================================================================
  // ARABIC ALPHABET (28 letters)
  // ============================================================================
  {
    arabic: 'ا',
    transliteration: 'Alif',
    english: 'First letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ب',
    transliteration: 'Ba',
    english: 'Second letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ت',
    transliteration: 'Ta',
    english: 'Third letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ث',
    transliteration: 'Tha',
    english: 'Fourth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ج',
    transliteration: 'Jim',
    english: 'Fifth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ح',
    transliteration: 'Ha',
    english: 'Sixth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'خ',
    transliteration: 'Kha',
    english: 'Seventh letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'د',
    transliteration: 'Dal',
    english: 'Eighth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ذ',
    transliteration: 'Dhal',
    english: 'Ninth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ر',
    transliteration: 'Ra',
    english: 'Tenth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ز',
    transliteration: 'Zay',
    english: 'Eleventh letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'س',
    transliteration: 'Sin',
    english: 'Twelfth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ش',
    transliteration: 'Shin',
    english: 'Thirteenth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ص',
    transliteration: 'Sad',
    english: 'Fourteenth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ض',
    transliteration: 'Dad',
    english: 'Fifteenth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ط',
    transliteration: 'Ta (emphatic)',
    english: 'Sixteenth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ظ',
    transliteration: 'Dha (emphatic)',
    english: 'Seventeenth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ع',
    transliteration: 'Ain',
    english: 'Eighteenth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 2,
  },
  {
    arabic: 'غ',
    transliteration: 'Ghain',
    english: 'Nineteenth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 2,
  },
  {
    arabic: 'ف',
    transliteration: 'Fa',
    english: 'Twentieth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ق',
    transliteration: 'Qaf',
    english: 'Twenty-first letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 2,
  },
  {
    arabic: 'ك',
    transliteration: 'Kaf',
    english: 'Twenty-second letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ل',
    transliteration: 'Lam',
    english: 'Twenty-third letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'م',
    transliteration: 'Mim',
    english: 'Twenty-fourth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ن',
    transliteration: 'Nun',
    english: 'Twenty-fifth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ه',
    transliteration: 'Ha',
    english: 'Twenty-sixth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'و',
    transliteration: 'Waw',
    english: 'Twenty-seventh letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
  {
    arabic: 'ي',
    transliteration: 'Ya',
    english: 'Twenty-eighth letter of Arabic alphabet',
    category: 'alphabet',
    difficulty: 1,
  },
];

async function seedVocabulary() {
  try {
    defaultLogger.info('Starting vocabulary seed...');

    // Insert all vocabulary words (on conflict do nothing for idempotency)
    await db.insert(vocabularyWords).values(VOCABULARY).onConflictDoNothing();

    // Count by category for verification
    const categoryCounts: Record<string, number> = {};
    VOCABULARY.forEach((word) => {
      categoryCounts[word.category] = (categoryCounts[word.category] || 0) + 1;
    });

    defaultLogger.info('Vocabulary seed complete', {
      totalWords: VOCABULARY.length,
      categoryCounts,
    });

    process.exit(0);
  } catch (error) {
    defaultLogger.error(
      'Error seeding vocabulary',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

// Run seed
seedVocabulary();
