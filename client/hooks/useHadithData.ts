import { useQuery } from "@tanstack/react-query";

// ============================================================================
// TYPES
// ============================================================================

export interface HadithCollection {
  id: string;
  name: string; // English name
  nameArabic: string; // Arabic name
  compiler: string;
  description: string;
  totalHadiths: number;
}

export interface Hadith {
  id: string;
  collection: string; // collection id
  bookNumber: number;
  hadithNumber: number;
  narrator: string;
  textArabic: string;
  textEnglish: string;
  grade: "Sahih" | "Hasan" | "Da'if";
  topics: string[];
}

// ============================================================================
// MOCK DATA FLAG - Toggle this to switch between mock and real API
// ============================================================================

const USE_MOCK_DATA = true;

// ============================================================================
// MOCK DATA - 30 authentic, well-known hadiths across 6 major collections
// ============================================================================

const MOCK_COLLECTIONS: HadithCollection[] = [
  {
    id: "bukhari",
    name: "Sahih al-Bukhari",
    nameArabic: "صحيح البخاري",
    compiler: "Imam Muhammad al-Bukhari",
    description:
      "The most authentic collection of hadith, compiled by Imam Bukhari over 16 years from over 600,000 narrations.",
    totalHadiths: 7563,
  },
  {
    id: "muslim",
    name: "Sahih Muslim",
    nameArabic: "صحيح مسلم",
    compiler: "Imam Muslim ibn al-Hajjaj",
    description:
      "The second most authentic hadith collection, known for its strict methodology and organization.",
    totalHadiths: 7500,
  },
  {
    id: "tirmidhi",
    name: "Jami at-Tirmidhi",
    nameArabic: "جامع الترمذي",
    compiler: "Imam Abu Isa at-Tirmidhi",
    description:
      "A comprehensive collection notable for grading each hadith and including jurisprudential commentary.",
    totalHadiths: 3956,
  },
  {
    id: "abudawud",
    name: "Sunan Abu Dawud",
    nameArabic: "سنن أبي داود",
    compiler: "Imam Abu Dawud as-Sijistani",
    description:
      "A major collection focused on hadiths of legal rulings, compiled from 500,000 narrations.",
    totalHadiths: 5274,
  },
  {
    id: "nasai",
    name: "Sunan an-Nasa'i",
    nameArabic: "سنن النسائي",
    compiler: "Imam Ahmad an-Nasa'i",
    description:
      "Known for its strict grading criteria, considered among the most reliable of the six collections.",
    totalHadiths: 5761,
  },
  {
    id: "ibnmajah",
    name: "Sunan Ibn Majah",
    nameArabic: "سنن ابن ماجه",
    compiler: "Imam Ibn Majah al-Qazwini",
    description:
      "The sixth of the canonical hadith collections, containing unique narrations not found in the other five.",
    totalHadiths: 4341,
  },
];

const MOCK_HADITHS: Record<string, Hadith[]> = {
  bukhari: [
    {
      id: "bukhari-1",
      collection: "bukhari",
      bookNumber: 1,
      hadithNumber: 1,
      narrator: "Umar ibn al-Khattab (RA)",
      textArabic:
        "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ",
      textEnglish:
        "Actions are judged by intentions, and every person will get what they intended. So whoever emigrated for the sake of Allah and His Messenger, then his emigration was for Allah and His Messenger. And whoever emigrated for worldly gain or to marry a woman, then his emigration was for whatever he emigrated for.",
      grade: "Sahih",
      topics: ["intentions", "sincerity", "deeds"],
    },
    {
      id: "bukhari-2",
      collection: "bukhari",
      bookNumber: 2,
      hadithNumber: 13,
      narrator: "Anas ibn Malik (RA)",
      textArabic:
        "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
      textEnglish:
        "None of you truly believes until he loves for his brother what he loves for himself.",
      grade: "Sahih",
      topics: ["faith", "brotherhood", "love"],
    },
    {
      id: "bukhari-3",
      collection: "bukhari",
      bookNumber: 3,
      hadithNumber: 56,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ",
      textEnglish:
        "Whoever believes in Allah and the Last Day, let him speak good or remain silent. Whoever believes in Allah and the Last Day, let him honor his neighbor. Whoever believes in Allah and the Last Day, let him honor his guest.",
      grade: "Sahih",
      topics: ["speech", "neighbors", "hospitality", "faith"],
    },
    {
      id: "bukhari-4",
      collection: "bukhari",
      bookNumber: 8,
      hadithNumber: 481,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ: تَعْدِلُ بَيْنَ اثْنَيْنِ صَدَقَةٌ، وَتُعِينُ الرَّجُلَ فِي دَابَّتِهِ فَتَحْمِلُهُ عَلَيْهَا أَوْ تَرْفَعُ لَهُ عَلَيْهَا مَتَاعَهُ صَدَقَةٌ، وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
      textEnglish:
        "Every joint of a person must perform a charity each day the sun rises: mediating justly between two people is charity, helping a man with his mount by lifting him onto it or loading his luggage is charity, and a good word is charity.",
      grade: "Sahih",
      topics: ["charity", "good deeds", "daily actions"],
    },
    {
      id: "bukhari-5",
      collection: "bukhari",
      bookNumber: 10,
      hadithNumber: 6018,
      narrator: "Abdullah ibn Amr (RA)",
      textArabic:
        "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ",
      textEnglish:
        "A Muslim is the one from whose tongue and hands other Muslims are safe, and an emigrant is the one who abandons what Allah has forbidden.",
      grade: "Sahih",
      topics: ["islam", "character", "safety"],
    },
    {
      id: "bukhari-6",
      collection: "bukhari",
      bookNumber: 78,
      hadithNumber: 6021,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "مَنْ لَا يَرْحَمْ لَا يُرْحَمْ",
      textEnglish:
        "He who does not show mercy will not be shown mercy.",
      grade: "Sahih",
      topics: ["mercy", "compassion", "character"],
    },
    {
      id: "bukhari-7",
      collection: "bukhari",
      bookNumber: 73,
      hadithNumber: 6116,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
      textEnglish:
        "The strong man is not the one who can overpower others. Rather, the strong man is the one who controls himself when he is angry.",
      grade: "Sahih",
      topics: ["anger", "self-control", "strength"],
    },
  ],
  muslim: [
    {
      id: "muslim-1",
      collection: "muslim",
      bookNumber: 1,
      hadithNumber: 1,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "الطُّهُورُ شَطْرُ الإِيمَانِ وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلَآنِ مَا بَيْنَ السَّمَاءِ وَالأَرْضِ",
      textEnglish:
        "Cleanliness is half of faith. Alhamdulillah fills the scales. SubhanAllah and Alhamdulillah fill what is between the heavens and the earth.",
      grade: "Sahih",
      topics: ["purification", "dhikr", "faith"],
    },
    {
      id: "muslim-2",
      collection: "muslim",
      bookNumber: 1,
      hadithNumber: 55,
      narrator: "Tamim ad-Dari (RA)",
      textArabic: "الدِّينُ النَّصِيحَةُ",
      textEnglish:
        "The religion is sincerity (good counsel). We said: To whom? He said: To Allah, His Book, His Messenger, the leaders of the Muslims, and their common folk.",
      grade: "Sahih",
      topics: ["sincerity", "advice", "religion"],
    },
    {
      id: "muslim-3",
      collection: "muslim",
      bookNumber: 32,
      hadithNumber: 6233,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا وَلَا تَدَابَرُوا وَلَا يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا",
      textEnglish:
        "Do not envy one another, do not inflate prices for one another, do not hate one another, do not turn away from one another, and do not undercut one another in trade. Be, O servants of Allah, brothers.",
      grade: "Sahih",
      topics: ["brotherhood", "envy", "social conduct"],
    },
    {
      id: "muslim-4",
      collection: "muslim",
      bookNumber: 45,
      hadithNumber: 2577,
      narrator: "Abu Dharr (RA)",
      textArabic:
        "لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ",
      textEnglish:
        "Do not belittle any good deed, even meeting your brother with a cheerful face.",
      grade: "Sahih",
      topics: ["good deeds", "kindness", "character"],
    },
    {
      id: "muslim-5",
      collection: "muslim",
      bookNumber: 1,
      hadithNumber: 2564,
      narrator: "An-Nawwas ibn Sam'an (RA)",
      textArabic:
        "الْبِرُّ حُسْنُ الْخُلُقِ وَالإِثْمُ مَا حَاكَ فِي صَدْرِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ",
      textEnglish:
        "Righteousness is good character, and sin is whatever disturbs your soul and which you dislike people finding out about.",
      grade: "Sahih",
      topics: ["righteousness", "character", "sin"],
    },
    {
      id: "muslim-6",
      collection: "muslim",
      bookNumber: 36,
      hadithNumber: 2699,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ",
      textEnglish:
        "Whoever relieves a believer of a hardship in this world, Allah will relieve him of a hardship on the Day of Resurrection.",
      grade: "Sahih",
      topics: ["helping others", "relief", "reward"],
    },
    {
      id: "muslim-7",
      collection: "muslim",
      bookNumber: 1,
      hadithNumber: 49,
      narrator: "Abu Sa'id al-Khudri (RA)",
      textArabic:
        "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ وَذَلِكَ أَضْعَفُ الإِيمَانِ",
      textEnglish:
        "Whoever among you sees an evil, let him change it with his hand; if he cannot, then with his tongue; if he cannot, then with his heart—and that is the weakest of faith.",
      grade: "Sahih",
      topics: ["enjoining good", "forbidding evil", "faith"],
    },
  ],
  tirmidhi: [
    {
      id: "tirmidhi-1",
      collection: "tirmidhi",
      bookNumber: 27,
      hadithNumber: 1987,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا وَخِيَارُكُمْ خِيَارُكُمْ لِنِسَائِهِمْ خُلُقًا",
      textEnglish:
        "The most complete of believers in faith are those with the best character, and the best of you are those who are best to their women.",
      grade: "Hasan",
      topics: ["faith", "character", "family"],
    },
    {
      id: "tirmidhi-2",
      collection: "tirmidhi",
      bookNumber: 36,
      hadithNumber: 2516,
      narrator: "Ibn Abbas (RA)",
      textArabic:
        "احْفَظِ اللَّهَ يَحْفَظْكَ احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ",
      textEnglish:
        "Be mindful of Allah and He will protect you. Be mindful of Allah and you will find Him before you. If you ask, ask Allah. If you seek help, seek help from Allah.",
      grade: "Sahih",
      topics: ["tawakkul", "reliance on Allah", "dua"],
    },
    {
      id: "tirmidhi-3",
      collection: "tirmidhi",
      bookNumber: 37,
      hadithNumber: 2687,
      narrator: "Anas ibn Malik (RA)",
      textArabic:
        "إِنَّ اللَّهَ يَرْضَى عَنِ الْعَبْدِ أَنْ يَأْكُلَ الأَكْلَةَ فَيَحْمَدَهُ عَلَيْهَا أَوْ يَشْرَبَ الشَّرْبَةَ فَيَحْمَدَهُ عَلَيْهَا",
      textEnglish:
        "Indeed, Allah is pleased with a servant who eats a meal and praises Him for it, or drinks a drink and praises Him for it.",
      grade: "Sahih",
      topics: ["gratitude", "food", "praise"],
    },
    {
      id: "tirmidhi-4",
      collection: "tirmidhi",
      bookNumber: 40,
      hadithNumber: 2318,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ",
      textEnglish:
        "Part of the perfection of a person's Islam is leaving that which does not concern him.",
      grade: "Hasan",
      topics: ["islam", "character", "speech"],
    },
    {
      id: "tirmidhi-5",
      collection: "tirmidhi",
      bookNumber: 45,
      hadithNumber: 2499,
      narrator: "Anas ibn Malik (RA)",
      textArabic:
        "مَا مِنْ مُسْلِمٍ يَغْرِسُ غَرْسًا أَوْ يَزْرَعُ زَرْعًا فَيَأْكُلُ مِنْهُ طَيْرٌ أَوْ إِنْسَانٌ أَوْ بَهِيمَةٌ إِلَّا كَانَ لَهُ بِهِ صَدَقَةٌ",
      textEnglish:
        "No Muslim plants a tree or sows seeds, and then a bird, or a person, or an animal eats from it, except that it is regarded as charity for him.",
      grade: "Sahih",
      topics: ["charity", "agriculture", "good deeds"],
    },
    {
      id: "tirmidhi-6",
      collection: "tirmidhi",
      bookNumber: 36,
      hadithNumber: 2510,
      narrator: "Shaddad ibn Aws (RA)",
      textArabic:
        "الْكَيِّسُ مَنْ دَانَ نَفْسَهُ وَعَمِلَ لِمَا بَعْدَ الْمَوْتِ وَالْعَاجِزُ مَنْ أَتْبَعَ نَفْسَهُ هَوَاهَا وَتَمَنَّى عَلَى اللَّهِ",
      textEnglish:
        "The wise man is one who holds himself accountable and works for what comes after death, and the foolish man is one who follows his desires and then places his hope in Allah.",
      grade: "Hasan",
      topics: ["self-accountability", "afterlife", "wisdom"],
    },
  ],
  abudawud: [
    {
      id: "abudawud-1",
      collection: "abudawud",
      bookNumber: 41,
      hadithNumber: 4800,
      narrator: "Abu Darda (RA)",
      textArabic:
        "مَا مِنْ شَيْءٍ أَثْقَلُ فِي الْمِيزَانِ مِنْ حُسْنِ الْخُلُقِ",
      textEnglish:
        "Nothing is heavier on the believer's scale on the Day of Resurrection than good character.",
      grade: "Sahih",
      topics: ["character", "scales", "Day of Judgment"],
    },
    {
      id: "abudawud-2",
      collection: "abudawud",
      bookNumber: 41,
      hadithNumber: 4903,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "الْمُؤْمِنُ مِرْآةُ الْمُؤْمِنِ وَالْمُؤْمِنُ أَخُو الْمُؤْمِنِ يَكُفُّ عَلَيْهِ ضَيْعَتَهُ وَيَحُوطُهُ مِنْ وَرَائِهِ",
      textEnglish:
        "A believer is the mirror of his fellow believer, and a believer is the brother of a believer; he safeguards his property and protects him from behind.",
      grade: "Hasan",
      topics: ["brotherhood", "mirror", "protection"],
    },
    {
      id: "abudawud-3",
      collection: "abudawud",
      bookNumber: 8,
      hadithNumber: 1479,
      narrator: "An-Nu'man ibn Bashir (RA)",
      textArabic:
        "الدُّعَاءُ هُوَ الْعِبَادَةُ",
      textEnglish:
        "Supplication (dua) is the essence of worship.",
      grade: "Sahih",
      topics: ["dua", "worship", "supplication"],
    },
    {
      id: "abudawud-4",
      collection: "abudawud",
      bookNumber: 41,
      hadithNumber: 4833,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "الرَّجُلُ عَلَى دِينِ خَلِيلِهِ فَلْيَنْظُرْ أَحَدُكُمْ مَنْ يُخَالِلُ",
      textEnglish:
        "A man follows the religion of his close friend, so let each of you look carefully at whom he befriends.",
      grade: "Hasan",
      topics: ["friendship", "companionship", "influence"],
    },
    {
      id: "abudawud-5",
      collection: "abudawud",
      bookNumber: 2,
      hadithNumber: 495,
      narrator: "Amr ibn Shu'ayb (RA)",
      textArabic:
        "مُرُوا أَوْلَادَكُمْ بِالصَّلَاةِ وَهُمْ أَبْنَاءُ سَبْعِ سِنِينَ",
      textEnglish:
        "Instruct your children to pray when they are seven years old.",
      grade: "Hasan",
      topics: ["prayer", "children", "parenting"],
    },
  ],
  nasai: [
    {
      id: "nasai-1",
      collection: "nasai",
      bookNumber: 47,
      hadithNumber: 5025,
      narrator: "Anas ibn Malik (RA)",
      textArabic:
        "حُبِّبَ إِلَيَّ مِنَ الدُّنْيَا النِّسَاءُ وَالطِّيبُ وَجُعِلَ قُرَّةُ عَيْنِي فِي الصَّلَاةِ",
      textEnglish:
        "Made beloved to me from your world are women and perfume, and the comfort of my eye is in prayer.",
      grade: "Sahih",
      topics: ["prayer", "love", "Prophet's character"],
    },
    {
      id: "nasai-2",
      collection: "nasai",
      bookNumber: 23,
      hadithNumber: 2578,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "قَالَ اللَّهُ تَعَالَى كُلُّ عَمَلِ ابْنِ آدَمَ لَهُ إِلَّا الصِّيَامَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ",
      textEnglish:
        "Allah said: Every deed of the son of Adam is for him, except fasting. It is for Me and I shall reward it.",
      grade: "Sahih",
      topics: ["fasting", "reward", "Hadith Qudsi"],
    },
    {
      id: "nasai-3",
      collection: "nasai",
      bookNumber: 8,
      hadithNumber: 904,
      narrator: "Uthman ibn Affan (RA)",
      textArabic:
        "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
      textEnglish:
        "The best among you are those who learn the Quran and teach it.",
      grade: "Sahih",
      topics: ["Quran", "learning", "teaching"],
    },
    {
      id: "nasai-4",
      collection: "nasai",
      bookNumber: 47,
      hadithNumber: 5010,
      narrator: "Aisha (RA)",
      textArabic:
        "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ وَيُعْطِي عَلَى الرِّفْقِ مَا لَا يُعْطِي عَلَى الْعُنْفِ",
      textEnglish:
        "Indeed, Allah is gentle and loves gentleness, and He grants reward for gentleness that He does not grant for harshness.",
      grade: "Sahih",
      topics: ["gentleness", "kindness", "character"],
    },
  ],
  ibnmajah: [
    {
      id: "ibnmajah-1",
      collection: "ibnmajah",
      bookNumber: 37,
      hadithNumber: 4169,
      narrator: "Sahl ibn Sa'd (RA)",
      textArabic:
        "لَوْ كَانَتِ الدُّنْيَا تَعْدِلُ عِنْدَ اللَّهِ جَنَاحَ بَعُوضَةٍ مَا سَقَى كَافِرًا مِنْهَا شَرْبَةَ مَاءٍ",
      textEnglish:
        "If this world were worth the wing of a mosquito to Allah, He would not have given a disbeliever even a sip of water from it.",
      grade: "Sahih",
      topics: ["dunya", "worldly life", "perspective"],
    },
    {
      id: "ibnmajah-2",
      collection: "ibnmajah",
      bookNumber: 33,
      hadithNumber: 3976,
      narrator: "Abu Hurairah (RA)",
      textArabic:
        "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ وَفِي كُلٍّ خَيْرٌ",
      textEnglish:
        "The strong believer is better and more beloved to Allah than the weak believer, and in each one there is good.",
      grade: "Sahih",
      topics: ["strength", "faith", "self-improvement"],
    },
    {
      id: "ibnmajah-3",
      collection: "ibnmajah",
      bookNumber: 1,
      hadithNumber: 224,
      narrator: "Anas ibn Malik (RA)",
      textArabic:
        "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
      textEnglish:
        "Seeking knowledge is an obligation upon every Muslim.",
      grade: "Sahih",
      topics: ["knowledge", "learning", "obligation"],
    },
    {
      id: "ibnmajah-4",
      collection: "ibnmajah",
      bookNumber: 33,
      hadithNumber: 3973,
      narrator: "Abdullah ibn Mas'ud (RA)",
      textArabic:
        "اسْتَحْيُوا مِنَ اللَّهِ حَقَّ الْحَيَاءِ قَالَ قُلْنَا يَا رَسُولَ اللَّهِ إِنَّا نَسْتَحْيِي وَالْحَمْدُ لِلَّهِ قَالَ لَيْسَ ذَاكَ",
      textEnglish:
        "Be truly shy before Allah. We said: O Messenger of Allah, we are shy, praise be to Allah. He said: That is not it. Being truly shy before Allah means to guard the head and what it contains, the stomach and what it holds, and to remember death and trial.",
      grade: "Hasan",
      topics: ["modesty", "shyness before Allah", "mindfulness"],
    },
  ],
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchCollections(): Promise<HadithCollection[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_COLLECTIONS;
  }

  const response = await fetch("/api/hadith/collections");
  if (!response.ok) {
    throw new Error("Failed to fetch hadith collections");
  }
  return response.json();
}

async function fetchHadiths(collection: string): Promise<Hadith[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_HADITHS[collection] || [];
  }

  const response = await fetch(`/api/hadith/${collection}`);
  if (!response.ok) {
    throw new Error("Failed to fetch hadiths");
  }
  return response.json();
}

async function searchHadiths(query: string): Promise<Hadith[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const allHadiths = Object.values(MOCK_HADITHS).flat();
    const q = query.toLowerCase();
    return allHadiths.filter(
      (h) =>
        h.textArabic.includes(query) ||
        h.textEnglish.toLowerCase().includes(q) ||
        h.narrator.toLowerCase().includes(q) ||
        h.topics.some((t) => t.toLowerCase().includes(q))
    );
  }

  const response = await fetch(
    `/api/hadith/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error("Failed to search hadiths");
  }
  return response.json();
}

async function fetchDailyHadith(): Promise<Hadith> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const allHadiths = Object.values(MOCK_HADITHS).flat();
    // Deterministic daily rotation based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return allHadiths[dayOfYear % allHadiths.length];
  }

  const response = await fetch("/api/hadith/daily");
  if (!response.ok) {
    throw new Error("Failed to fetch daily hadith");
  }
  return response.json();
}

async function fetchHadithById(id: string): Promise<Hadith | undefined> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const allHadiths = Object.values(MOCK_HADITHS).flat();
    return allHadiths.find((h) => h.id === id);
  }

  const response = await fetch(`/api/hadith/detail/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch hadith");
  }
  return response.json();
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Fetches the list of all hadith collections
 */
export function useHadithCollections() {
  return useQuery({
    queryKey: ["hadith", "collections"],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetches all hadiths for a specific collection
 */
export function useHadiths(collection: string) {
  return useQuery({
    queryKey: ["hadith", "list", collection],
    queryFn: () => fetchHadiths(collection),
    enabled: collection.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Searches hadiths by text (Arabic, English, narrator, or topic)
 */
export function useHadithSearch(query: string) {
  return useQuery({
    queryKey: ["hadith", "search", query],
    queryFn: () => searchHadiths(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetches the daily hadith (rotates based on day of year)
 */
export function useDailyHadith() {
  return useQuery({
    queryKey: ["hadith", "daily"],
    queryFn: fetchDailyHadith,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetches a single hadith by ID
 */
export function useHadithById(id: string) {
  return useQuery({
    queryKey: ["hadith", "detail", id],
    queryFn: () => fetchHadithById(id),
    enabled: id.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
