/**
 * AI Dua Recommender Service
 *
 * Provides dua recommendations based on user situations and emotional states.
 * Currently uses mock data; will be upgraded to RAG search + Claude formatting.
 */

export interface DuaRecommendationRequest {
  situation: string;
  emotionalState?: string;
  keywords?: string[];
}

export interface DuaResult {
  arabic: string;
  transliteration: string;
  translation: string;
  source: string; // e.g., "Sahih Bukhari 5971"
  occasion: string; // e.g., "When feeling anxious"
  category: string; // e.g., "Protection", "Gratitude"
}

/**
 * Mock dua database with authentic hadith duas
 * Sources: Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, Tirmidhi, Hisn al-Muslim
 */
const mockDuas: DuaResult[] = [
  // Anxiety & Stress
  {
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الهَمِّ وَالحَزَنِ، وَالعَجْزِ وَالكَسَلِ، وَالبُخْلِ وَالجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    transliteration:
      "Allāhumma innī aʿūdhu bika min al-hammi wal-ḥazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa ḍalaʿ al-dayn, wa ghalabat al-rijāl",
    translation:
      "O Allah, I seek refuge in You from worry and grief, from weakness and laziness, from miserliness and cowardice, from being overcome by debt and from being overpowered by men.",
    source: "Sahih Bukhari 6369",
    occasion: "When feeling anxious or stressed",
    category: "Protection",
  },
  {
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الوَكِيلُ",
    transliteration: "Ḥasbunā Allāhu wa niʿma al-wakīl",
    translation:
      "Allah is sufficient for us, and He is the best Disposer of affairs.",
    source: "Quran 3:173",
    occasion: "When facing difficulties or feeling overwhelmed",
    category: "Protection",
  },
  {
    arabic:
      "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "Lā ilāha illā anta subḥānaka innī kuntu min aẓ-ẓālimīn",
    translation:
      "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    source: "Quran 21:87",
    occasion: "Dua of Prophet Yunus (Jonah) - for distress and difficulty",
    category: "Protection",
  },

  // Gratitude
  {
    arabic: "الحَمْدُ لِلَّهِ رَبِّ العَالَمِينَ",
    transliteration: "Alḥamdu lillāhi rabbi al-ʿālamīn",
    translation: "All praise is due to Allah, Lord of the worlds.",
    source: "Quran 1:2",
    occasion: "Expressing gratitude for blessings",
    category: "Gratitude",
  },
  {
    arabic:
      "اللَّهُمَّ لَكَ الحَمْدُ كُلُّهُ، اللَّهُمَّ لَا قَابِضَ لِمَا بَسَطْتَ، وَلَا بَاسِطَ لِمَا قَبَضْتَ، وَلَا هَادِيَ لِمَنْ أَضْلَلْتَ، وَلَا مُضِلَّ لِمَنْ هَدَيْتَ",
    transliteration:
      "Allāhumma laka al-ḥamdu kulluhu, Allāhumma lā qābiḍa limā basaṭta, wa lā bāsiṭa limā qabaḍta, wa lā hādiya liman aḍlalta, wa lā muḍilla liman hadayta",
    translation:
      "O Allah, all praise is for You. O Allah, there is none who can withhold what You give, and none can give what You withhold, and there is no guide for whom You let go astray, and none can lead astray whom You guide.",
    source: "Sahih Bukhari 7385",
    occasion: "Praising Allah and acknowledging His control",
    category: "Gratitude",
  },

  // Before Sleep
  {
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allāhumma amūtu wa aḥyā",
    translation: "In Your name, O Allah, I die and I live.",
    source: "Sahih Bukhari 6312",
    occasion: "Before going to sleep",
    category: "Daily",
  },
  {
    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    transliteration: "Allāhumma qinī ʿadhābaka yawma tabʿathu ʿibādak",
    translation:
      "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
    source: "Sunan Abu Dawud 5045",
    occasion: "Before sleeping, placing hand under right cheek",
    category: "Daily",
  },

  // Morning & Evening
  {
    arabic:
      "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "Aṣbaḥnā wa aṣbaḥa al-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illā Allāhu waḥdahu lā sharīka lah, lahu al-mulku wa lahu al-ḥamdu wa huwa ʿalā kulli shay'in qadīr",
    translation:
      "We have entered the morning, and the whole kingdom of Allah has entered the morning. All praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner. To Him belongs the sovereignty and all praise, and He has power over all things.",
    source: "Sahih Muslim 2723",
    occasion: "Morning remembrance",
    category: "Daily",
  },
  {
    arabic:
      "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:
      "Amsaynā wa amsā al-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illā Allāhu waḥdahu lā sharīka lah",
    translation:
      "We have entered the evening, and the whole kingdom of Allah has entered the evening. All praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner.",
    source: "Sahih Muslim 2723",
    occasion: "Evening remembrance",
    category: "Daily",
  },

  // Seeking Guidance
  {
    arabic:
      "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ العَظِيمِ",
    transliteration:
      "Allāhumma innī astakhīruka bi-ʿilmika, wa astaqdiruka bi-qudratika, wa as'aluka min faḍlika al-ʿaẓīm",
    translation:
      "O Allah, I seek Your guidance by virtue of Your knowledge, and I seek ability by virtue of Your power, and I ask You of Your great bounty.",
    source: "Sahih Bukhari 1162",
    occasion: "Prayer of Istikhara - seeking guidance in decisions",
    category: "Guidance",
  },
  {
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي",
    transliteration: "Rabbi ishraḥ lī ṣadrī, wa yassir lī amrī",
    translation: "My Lord, expand for me my breast and ease for me my task.",
    source: "Quran 20:25-26",
    occasion: "Dua of Prophet Musa - seeking ease in difficult tasks",
    category: "Guidance",
  },

  // Protection
  {
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration:
      "Aʿūdhu bi-kalimāti Allāhi at-tāmmāti min sharri mā khalaq",
    translation:
      "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    source: "Sahih Muslim 2708",
    occasion: "Seeking protection from harm",
    category: "Protection",
  },
  {
    arabic:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ",
    transliteration:
      "Bismillāhi alladhī lā yaḍurru maʿa ismihi shay'un fī al-arḍi wa lā fī as-samā'i wa huwa as-samīʿu al-ʿalīm",
    translation:
      "In the Name of Allah, with Whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing.",
    source: "Sunan Abu Dawud 5088",
    occasion: "Morning and evening protection (3 times)",
    category: "Protection",
  },

  // Forgiveness
  {
    arabic: "رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَارْزُقْنِي وَعَافِنِي",
    transliteration:
      "Rabbi ighfir lī wa irḥamnī wa ihdinī wa irzuqnī wa ʿāfinī",
    translation:
      "My Lord, forgive me, have mercy on me, guide me, provide for me, and grant me well-being.",
    source: "Sunan Abu Dawud 850",
    occasion: "Between prostrations in prayer",
    category: "Forgiveness",
  },
  {
    arabic:
      "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الخَاسِرِينَ",
    transliteration:
      "Rabbanā ẓalamnā anfusanā wa in lam taghfir lanā wa tarḥamnā lanakūnanna min al-khāsirīn",
    translation:
      "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    source: "Quran 7:23",
    occasion: "Seeking forgiveness for wrongdoing",
    category: "Forgiveness",
  },
];

/**
 * Search duas based on user's situation and emotional state
 *
 * @param request - Dua recommendation request with situation, emotional state, and keywords
 * @returns Array of matching duas with Arabic text, transliteration, translation, and source
 *
 * TODO: Implement RAG search against knowledge base (6,241 docs)
 * TODO: Integrate Claude Haiku for intelligent formatting and authenticity checking
 */
export async function searchDuas(
  request: DuaRecommendationRequest,
): Promise<DuaResult[]> {
  // Normalize search terms
  const searchTerms = [
    request.situation.toLowerCase(),
    ...(request.emotionalState ? [request.emotionalState.toLowerCase()] : []),
    ...(request.keywords?.map((k) => k.toLowerCase()) || []),
  ];

  // Filter duas based on keyword matching
  const matchedDuas = mockDuas.filter((dua) => {
    const duaText =
      `${dua.category} ${dua.occasion} ${dua.translation}`.toLowerCase();

    return searchTerms.some((term) => {
      // Check for direct matches
      if (duaText.includes(term)) return true;

      // Check for related terms
      if (
        term.includes("stress") ||
        term.includes("anxious") ||
        term.includes("anxiety")
      ) {
        return (
          duaText.includes("anxious") ||
          duaText.includes("worry") ||
          duaText.includes("distress")
        );
      }
      if (
        term.includes("thank") ||
        term.includes("grateful") ||
        term.includes("gratitude")
      ) {
        return duaText.includes("gratitude") || duaText.includes("praise");
      }
      if (term.includes("sleep") || term.includes("night")) {
        return duaText.includes("sleep");
      }
      if (term.includes("morning")) {
        return duaText.includes("morning");
      }
      if (term.includes("evening")) {
        return duaText.includes("evening");
      }
      if (
        term.includes("guidance") ||
        term.includes("decision") ||
        term.includes("choice")
      ) {
        return duaText.includes("guidance") || duaText.includes("istikhara");
      }
      if (
        term.includes("protect") ||
        term.includes("safe") ||
        term.includes("harm")
      ) {
        return duaText.includes("protection") || duaText.includes("refuge");
      }
      if (
        term.includes("forgive") ||
        term.includes("sin") ||
        term.includes("mistake")
      ) {
        return duaText.includes("forgiveness") || duaText.includes("forgive");
      }

      return false;
    });
  });

  // Return up to 5 most relevant duas
  // If no matches, return a few general duas
  if (matchedDuas.length === 0) {
    return mockDuas.slice(0, 3);
  }

  return matchedDuas.slice(0, 5);
}
