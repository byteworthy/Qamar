-- ============================================================================
-- ISLAMIC FEATURES MIGRATION
-- Adds tables for Quran, Prayer, Arabic Learning, and Progress Tracking
-- Run after base create-tables.sql
-- ============================================================================

-- Quran Metadata (reference data - surah information)
CREATE TABLE IF NOT EXISTS quran_metadata (
  id SERIAL PRIMARY KEY,
  surah_number INTEGER NOT NULL UNIQUE,
  name_arabic TEXT NOT NULL,
  name_english TEXT NOT NULL,
  verses_count INTEGER NOT NULL,
  revelation_place TEXT NOT NULL CHECK (revelation_place IN ('Makkah', 'Madinah')),
  order_in_revelation INTEGER
);

CREATE INDEX IF NOT EXISTS quran_metadata_surah_number_idx
  ON quran_metadata(surah_number);

-- Quran Bookmarks (user-specific, encrypted notes)
CREATE TABLE IF NOT EXISTS quran_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT quran_bookmarks_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS quran_bookmarks_user_id_idx
  ON quran_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS quran_bookmarks_surah_verse_idx
  ON quran_bookmarks(surah_number, verse_number);

-- Prayer Preferences (user-specific, location data)
CREATE TABLE IF NOT EXISTS prayer_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  calculation_method TEXT NOT NULL DEFAULT 'MWL',
  madhab TEXT DEFAULT 'Shafi',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  latitude REAL,
  longitude REAL,
  location_name TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT prayer_preferences_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Arabic Flashcards (FSRS spaced repetition progress)
CREATE TABLE IF NOT EXISTS arabic_flashcards (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  difficulty REAL NOT NULL DEFAULT 0,
  stability REAL NOT NULL DEFAULT 0,
  last_review TIMESTAMP,
  next_review TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review', 'relearning')),
  CONSTRAINT arabic_flashcards_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS arabic_flashcards_user_word_idx
  ON arabic_flashcards(user_id, word_id);
CREATE INDEX IF NOT EXISTS arabic_flashcards_next_review_idx
  ON arabic_flashcards(next_review);

-- User Progress (aggregated stats for all features)
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  quran_verses_read INTEGER DEFAULT 0,
  arabic_words_learned INTEGER DEFAULT 0,
  prayer_times_checked INTEGER DEFAULT 0,
  reflection_sessions_completed INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_progress_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS user_progress_last_active_date_idx
  ON user_progress(last_active_date);

-- Insight Summaries (AI-generated summaries)
CREATE TABLE IF NOT EXISTS insight_summaries (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  reflection_count INTEGER NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT insight_summaries_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS insight_summaries_user_id_idx
  ON insight_summaries(user_id);

-- Assumption Library (tracked assumptions from CBT sessions)
CREATE TABLE IF NOT EXISTS assumption_library (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  assumption_label TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT assumption_library_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS assumption_library_user_id_idx
  ON assumption_library(user_id);

-- Foreign key from sessions to users (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sessions_user_fk'
  ) THEN
    ALTER TABLE sessions
      ADD CONSTRAINT sessions_user_fk
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- SEED: Quran Metadata (114 Surahs)
-- ============================================================================
INSERT INTO quran_metadata (surah_number, name_arabic, name_english, verses_count, revelation_place, order_in_revelation) VALUES
  (1, 'الفاتحة', 'Al-Fatihah', 7, 'Makkah', 5),
  (2, 'البقرة', 'Al-Baqarah', 286, 'Madinah', 87),
  (3, 'آل عمران', 'Ali Imran', 200, 'Madinah', 89),
  (4, 'النساء', 'An-Nisa', 176, 'Madinah', 92),
  (5, 'المائدة', 'Al-Ma''idah', 120, 'Madinah', 112),
  (6, 'الأنعام', 'Al-An''am', 165, 'Makkah', 55),
  (7, 'الأعراف', 'Al-A''raf', 206, 'Makkah', 39),
  (8, 'الأنفال', 'Al-Anfal', 75, 'Madinah', 88),
  (9, 'التوبة', 'At-Tawbah', 129, 'Madinah', 113),
  (10, 'يونس', 'Yunus', 109, 'Makkah', 51),
  (11, 'هود', 'Hud', 123, 'Makkah', 52),
  (12, 'يوسف', 'Yusuf', 111, 'Makkah', 53),
  (13, 'الرعد', 'Ar-Ra''d', 43, 'Madinah', 96),
  (14, 'إبراهيم', 'Ibrahim', 52, 'Makkah', 72),
  (15, 'الحجر', 'Al-Hijr', 99, 'Makkah', 54),
  (16, 'النحل', 'An-Nahl', 128, 'Makkah', 70),
  (17, 'الإسراء', 'Al-Isra', 111, 'Makkah', 50),
  (18, 'الكهف', 'Al-Kahf', 110, 'Makkah', 69),
  (19, 'مريم', 'Maryam', 98, 'Makkah', 44),
  (20, 'طه', 'Ta-Ha', 135, 'Makkah', 45),
  (21, 'الأنبياء', 'Al-Anbiya', 112, 'Makkah', 73),
  (22, 'الحج', 'Al-Hajj', 78, 'Madinah', 103),
  (23, 'المؤمنون', 'Al-Mu''minun', 118, 'Makkah', 74),
  (24, 'النور', 'An-Nur', 64, 'Madinah', 102),
  (25, 'الفرقان', 'Al-Furqan', 77, 'Makkah', 42),
  (26, 'الشعراء', 'Ash-Shu''ara', 227, 'Makkah', 47),
  (27, 'النمل', 'An-Naml', 93, 'Makkah', 48),
  (28, 'القصص', 'Al-Qasas', 88, 'Makkah', 49),
  (29, 'العنكبوت', 'Al-Ankabut', 69, 'Makkah', 85),
  (30, 'الروم', 'Ar-Rum', 60, 'Makkah', 84),
  (31, 'لقمان', 'Luqman', 34, 'Makkah', 57),
  (32, 'السجدة', 'As-Sajdah', 30, 'Makkah', 75),
  (33, 'الأحزاب', 'Al-Ahzab', 73, 'Madinah', 90),
  (34, 'سبأ', 'Saba', 54, 'Makkah', 58),
  (35, 'فاطر', 'Fatir', 45, 'Makkah', 43),
  (36, 'يس', 'Ya-Sin', 83, 'Makkah', 41),
  (37, 'الصافات', 'As-Saffat', 182, 'Makkah', 56),
  (38, 'ص', 'Sad', 88, 'Makkah', 38),
  (39, 'الزمر', 'Az-Zumar', 75, 'Makkah', 59),
  (40, 'غافر', 'Ghafir', 85, 'Makkah', 60),
  (41, 'فصلت', 'Fussilat', 54, 'Makkah', 61),
  (42, 'الشورى', 'Ash-Shura', 53, 'Makkah', 62),
  (43, 'الزخرف', 'Az-Zukhruf', 89, 'Makkah', 63),
  (44, 'الدخان', 'Ad-Dukhan', 59, 'Makkah', 64),
  (45, 'الجاثية', 'Al-Jathiyah', 37, 'Makkah', 65),
  (46, 'الأحقاف', 'Al-Ahqaf', 35, 'Makkah', 66),
  (47, 'محمد', 'Muhammad', 38, 'Madinah', 95),
  (48, 'الفتح', 'Al-Fath', 29, 'Madinah', 111),
  (49, 'الحجرات', 'Al-Hujurat', 18, 'Madinah', 106),
  (50, 'ق', 'Qaf', 45, 'Makkah', 34),
  (51, 'الذاريات', 'Adh-Dhariyat', 60, 'Makkah', 67),
  (52, 'الطور', 'At-Tur', 49, 'Makkah', 76),
  (53, 'النجم', 'An-Najm', 62, 'Makkah', 23),
  (54, 'القمر', 'Al-Qamar', 55, 'Makkah', 37),
  (55, 'الرحمن', 'Ar-Rahman', 78, 'Madinah', 97),
  (56, 'الواقعة', 'Al-Waqi''ah', 96, 'Makkah', 46),
  (57, 'الحديد', 'Al-Hadid', 29, 'Madinah', 94),
  (58, 'المجادلة', 'Al-Mujadilah', 22, 'Madinah', 105),
  (59, 'الحشر', 'Al-Hashr', 24, 'Madinah', 101),
  (60, 'الممتحنة', 'Al-Mumtahanah', 13, 'Madinah', 91),
  (61, 'الصف', 'As-Saf', 14, 'Madinah', 109),
  (62, 'الجمعة', 'Al-Jumu''ah', 11, 'Madinah', 110),
  (63, 'المنافقون', 'Al-Munafiqun', 11, 'Madinah', 104),
  (64, 'التغابن', 'At-Taghabun', 18, 'Madinah', 108),
  (65, 'الطلاق', 'At-Talaq', 12, 'Madinah', 99),
  (66, 'التحريم', 'At-Tahrim', 12, 'Madinah', 107),
  (67, 'الملك', 'Al-Mulk', 30, 'Makkah', 77),
  (68, 'القلم', 'Al-Qalam', 52, 'Makkah', 2),
  (69, 'الحاقة', 'Al-Haqqah', 52, 'Makkah', 78),
  (70, 'المعارج', 'Al-Ma''arij', 44, 'Makkah', 79),
  (71, 'نوح', 'Nuh', 28, 'Makkah', 71),
  (72, 'الجن', 'Al-Jinn', 28, 'Makkah', 40),
  (73, 'المزمل', 'Al-Muzzammil', 20, 'Makkah', 3),
  (74, 'المدثر', 'Al-Muddaththir', 56, 'Makkah', 4),
  (75, 'القيامة', 'Al-Qiyamah', 40, 'Makkah', 31),
  (76, 'الإنسان', 'Al-Insan', 31, 'Madinah', 98),
  (77, 'المرسلات', 'Al-Mursalat', 50, 'Makkah', 33),
  (78, 'النبأ', 'An-Naba', 40, 'Makkah', 80),
  (79, 'النازعات', 'An-Nazi''at', 46, 'Makkah', 81),
  (80, 'عبس', 'Abasa', 42, 'Makkah', 24),
  (81, 'التكوير', 'At-Takwir', 29, 'Makkah', 7),
  (82, 'الانفطار', 'Al-Infitar', 19, 'Makkah', 82),
  (83, 'المطففين', 'Al-Mutaffifin', 36, 'Makkah', 86),
  (84, 'الانشقاق', 'Al-Inshiqaq', 25, 'Makkah', 83),
  (85, 'البروج', 'Al-Buruj', 22, 'Makkah', 27),
  (86, 'الطارق', 'At-Tariq', 17, 'Makkah', 36),
  (87, 'الأعلى', 'Al-A''la', 19, 'Makkah', 8),
  (88, 'الغاشية', 'Al-Ghashiyah', 26, 'Makkah', 68),
  (89, 'الفجر', 'Al-Fajr', 30, 'Makkah', 10),
  (90, 'البلد', 'Al-Balad', 20, 'Makkah', 35),
  (91, 'الشمس', 'Ash-Shams', 15, 'Makkah', 26),
  (92, 'الليل', 'Al-Layl', 21, 'Makkah', 9),
  (93, 'الضحى', 'Ad-Duha', 11, 'Makkah', 11),
  (94, 'الشرح', 'Ash-Sharh', 8, 'Makkah', 12),
  (95, 'التين', 'At-Tin', 8, 'Makkah', 28),
  (96, 'العلق', 'Al-Alaq', 19, 'Makkah', 1),
  (97, 'القدر', 'Al-Qadr', 5, 'Makkah', 25),
  (98, 'البينة', 'Al-Bayyinah', 8, 'Madinah', 100),
  (99, 'الزلزلة', 'Az-Zalzalah', 8, 'Madinah', 93),
  (100, 'العاديات', 'Al-Adiyat', 11, 'Makkah', 14),
  (101, 'القارعة', 'Al-Qari''ah', 11, 'Makkah', 30),
  (102, 'التكاثر', 'At-Takathur', 8, 'Makkah', 16),
  (103, 'العصر', 'Al-Asr', 3, 'Makkah', 13),
  (104, 'الهمزة', 'Al-Humazah', 9, 'Makkah', 32),
  (105, 'الفيل', 'Al-Fil', 5, 'Makkah', 19),
  (106, 'قريش', 'Quraysh', 4, 'Makkah', 29),
  (107, 'الماعون', 'Al-Ma''un', 7, 'Makkah', 17),
  (108, 'الكوثر', 'Al-Kawthar', 3, 'Makkah', 15),
  (109, 'الكافرون', 'Al-Kafirun', 6, 'Makkah', 18),
  (110, 'النصر', 'An-Nasr', 3, 'Madinah', 114),
  (111, 'المسد', 'Al-Masad', 5, 'Makkah', 6),
  (112, 'الإخلاص', 'Al-Ikhlas', 4, 'Makkah', 22),
  (113, 'الفلق', 'Al-Falaq', 5, 'Makkah', 20),
  (114, 'الناس', 'An-Nas', 6, 'Makkah', 21)
ON CONFLICT (surah_number) DO NOTHING;

SELECT 'Islamic feature tables and seed data created successfully!' AS result;
