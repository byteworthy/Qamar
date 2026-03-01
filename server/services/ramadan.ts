/**
 * Ramadan Service
 *
 * Provides Ramadan date calculations and 30 days of curated daily content.
 * Content follows the traditional Ramadan thirds structure:
 *   Days 1-10:  Mercy (Rahma)
 *   Days 11-20: Forgiveness (Maghfira)
 *   Days 21-30: Freedom from Fire (Itq min an-Nar)
 */

// =============================================================================
// TYPES
// =============================================================================

export interface RamadanDayContent {
  day: number;
  theme: string;
  dhikr: string;
  dua: { arabic: string; transliteration: string; meaning: string };
  hadith: string;
  reflectionPrompt: string;
}

// =============================================================================
// HIJRI DATE HELPERS
// =============================================================================

/**
 * Returns the current Hijri month and day using the Intl API.
 * Returns null if the environment does not support the islamic-umalqura calendar.
 */
function getHijriDate(): { month: number; day: number } | null {
  try {
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      month: "numeric",
      day: "numeric",
    });

    const parts = formatter.formatToParts(new Date());
    const monthPart = parts.find((p) => p.type === "month");
    const dayPart = parts.find((p) => p.type === "day");

    if (!monthPart || !dayPart) {
      return null;
    }

    return {
      month: parseInt(monthPart.value, 10),
      day: parseInt(dayPart.value, 10),
    };
  } catch {
    return null;
  }
}

/**
 * Returns true if the current Hijri month is Ramadan (month 9).
 */
export function isRamadan(): boolean {
  const hijri = getHijriDate();
  if (!hijri) return false;
  return hijri.month === 9;
}

/**
 * Returns the current day of Ramadan (1-30) or null if it is not Ramadan.
 */
export function getRamadanDay(): number | null {
  const hijri = getHijriDate();
  if (!hijri || hijri.month !== 9) return null;
  return hijri.day;
}

/**
 * Returns the curated content for a specific Ramadan day (1-30).
 * Returns null if the day is out of range.
 */
export function getRamadanDayContent(day: number): RamadanDayContent | null {
  const entry = RAMADAN_DAILY_CONTENT.find((d) => d.day === day);
  return entry ?? null;
}

// =============================================================================
// 30 DAYS OF RAMADAN CONTENT
// =============================================================================

export const RAMADAN_DAILY_CONTENT: RamadanDayContent[] = [
  // =========================================================================
  // FIRST TEN — MERCY (Rahma)
  // =========================================================================
  {
    day: 1,
    theme: "Welcoming Mercy",
    dhikr: "Ya Rahman, Ya Raheem (O Most Merciful, O Most Compassionate)",
    dua: {
      arabic:
        "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالإِيمَانِ وَالسَّلَامَةِ وَالإِسْلَامِ",
      transliteration:
        "Allahumma ahillahu 'alayna bil-yumni wal-iman was-salamati wal-Islam",
      meaning:
        "O Allah, let this month dawn upon us with blessing, faith, safety, and Islam.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'When Ramadan begins, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.' (Bukhari & Muslim)",
    reflectionPrompt:
      "What doors of mercy do you hope Allah opens for you this Ramadan? What old habits do you want to leave behind at the gate?",
  },
  {
    day: 2,
    theme: "The Mercy Within Hunger",
    dhikr: "SubhanAllah wa bihamdihi (Glory be to Allah and His praise)",
    dua: {
      arabic:
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ رَحْمَتَكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ",
      transliteration:
        "Allahumma inni as'aluka rahmataka allati wasi'at kulla shay'",
      meaning:
        "O Allah, I ask You for Your mercy which encompasses all things.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Whoever fasts Ramadan with faith and seeking reward, his past sins are forgiven.' (Bukhari & Muslim)",
    reflectionPrompt:
      "When you feel the discomfort of hunger today, how can you reframe that physical emptiness as spiritual filling?",
  },
  {
    day: 3,
    theme: "Mercy to the Body",
    dhikr:
      "Alhamdulillah 'ala kulli hal (All praise to Allah in every condition)",
    dua: {
      arabic:
        "اللَّهُمَّ عَافِنِي فِي بَدَنِي وَعَافِنِي فِي سَمْعِي وَعَافِنِي فِي بَصَرِي",
      transliteration:
        "Allahumma 'afini fi badani wa 'afini fi sam'i wa 'afini fi basari",
      meaning:
        "O Allah, grant me health in my body, grant me health in my hearing, grant me health in my sight.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Your body has a right over you.' (Bukhari)",
    reflectionPrompt:
      "How has Allah shown mercy to your body that you have overlooked? What blessings of health have you taken for granted?",
  },
  {
    day: 4,
    theme: "Mercy in Speech",
    dhikr:
      "La hawla wa la quwwata illa billah (There is no power or strength except with Allah)",
    dua: {
      arabic:
        "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
      transliteration:
        "Rabbij'alni muqima as-salati wa min dhurriyyati Rabbana wa taqabbal du'a",
      meaning:
        "My Lord, make me an establisher of prayer, and from my descendants. Our Lord, accept my supplication.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Whoever does not give up false speech and acting upon it, Allah has no need for him to give up his food and drink.' (Bukhari)",
    reflectionPrompt:
      "What words do you need to fast from today — not just food? What speech patterns pull you away from Allah's mercy?",
  },
  {
    day: 5,
    theme: "Mercy to Others",
    dhikr:
      "Allahumma salli 'ala Muhammad (O Allah, send blessings upon Muhammad)",
    dua: {
      arabic: "اللَّهُمَّ اجْعَلْنِي مِنَ الْمُحْسِنِينَ",
      transliteration: "Allahummaj'alni minal-muhsineen",
      meaning: "O Allah, make me among those who do good to others.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'The most beloved people to Allah are those who are most beneficial to people.' (Tabarani)",
    reflectionPrompt:
      "Who in your life needs your mercy right now? What small act of kindness can you extend today that mirrors the mercy you seek from Allah?",
  },
  {
    day: 6,
    theme: "Mercy in Patience",
    dhikr: "Ya Sabur (O Most Patient One)",
    dua: {
      arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ",
      transliteration: "Rabbana afrigh 'alayna sabran wa tawaffana muslimeen",
      meaning: "Our Lord, pour upon us patience and let us die as Muslims.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Fasting is a shield. When one of you is fasting, let him not behave in an obscene or foolish manner.' (Bukhari & Muslim)",
    reflectionPrompt:
      "Where does your patience wear thinnest during fasting? What if that exact friction point is where Allah is growing you?",
  },
  {
    day: 7,
    theme: "Mercy Through Gratitude",
    dhikr:
      "Alhamdulillahi Rabbil 'aalameen (All praise is for Allah, Lord of all worlds)",
    dua: {
      arabic:
        "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
      transliteration:
        "Rabbi awzi'ni an ashkura ni'mataka allati an'amta 'alayya",
      meaning:
        "My Lord, enable me to be grateful for Your favor which You have bestowed upon me.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Look at those below you and do not look at those above you, for it is better that you do not belittle Allah's blessings on you.' (Bukhari & Muslim)",
    reflectionPrompt:
      "List three blessings you only noticed because fasting stripped away your routine comfort. How does scarcity reveal abundance?",
  },
  {
    day: 8,
    theme: "Mercy in the Quran",
    dhikr:
      "Allahumma inni as'aluka al-huda wat-tuqa (O Allah, I ask You for guidance and piety)",
    dua: {
      arabic:
        "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
      transliteration:
        "Rabbana atina min ladunka rahmatan wa hayyi' lana min amrina rashada",
      meaning:
        "Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'The best of you are those who learn the Quran and teach it.' (Bukhari)",
    reflectionPrompt:
      "Which verse of the Quran has been speaking to your heart lately? What message might Allah be sending you through His words this Ramadan?",
  },
  {
    day: 9,
    theme: "Mercy in Community",
    dhikr:
      "SubhanAllahi wa bihamdihi, SubhanAllahil Adheem (Glory be to Allah and His praise, Glory be to Allah the Supreme)",
    dua: {
      arabic: "اللَّهُمَّ أَلِّفْ بَيْنَ قُلُوبِنَا وَأَصْلِحْ ذَاتَ بَيْنِنَا",
      transliteration: "Allahumma allif bayna quloobina wa aslih dhata baynina",
      meaning: "O Allah, unite our hearts and mend our relationships.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Whoever feeds a fasting person will have a reward like that of the fasting person, without any reduction.' (Tirmidhi)",
    reflectionPrompt:
      "How has the ummah shown you mercy when you needed it most? What can you give back to your community this Ramadan?",
  },
  {
    day: 10,
    theme: "The Fullness of Mercy",
    dhikr: "Ya Wadud (O Most Loving)",
    dua: {
      arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
      transliteration: "Ya Hayyu ya Qayyumu bi-rahmatika astaghith",
      meaning: "O Ever-Living, O Self-Sustaining, in Your mercy I seek relief.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Allah divided mercy into one hundred parts. He kept ninety-nine parts with Himself and sent down one part to the earth.' (Bukhari & Muslim)",
    reflectionPrompt:
      "If Allah's one part of mercy is everything we see of compassion in this world, what does that tell you about the ninety-nine He has reserved? How does that reshape your fear?",
  },
  // =========================================================================
  // SECOND TEN — FORGIVENESS (Maghfira)
  // =========================================================================
  {
    day: 11,
    theme: "Turning to Forgiveness",
    dhikr:
      "Astaghfirullah al-Adheem (I seek forgiveness from Allah the Supreme)",
    dua: {
      arabic:
        "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
      transliteration:
        "Rabbana dhalamna anfusana wa in lam taghfir lana wa tarhamna lanakoonanna minal-khasireen",
      meaning:
        "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'By Allah, I seek forgiveness from Allah and repent to Him more than seventy times a day.' (Bukhari)",
    reflectionPrompt:
      "What are you carrying that you have not yet asked Allah to forgive? What would it feel like to truly let it go?",
  },
  {
    day: 12,
    theme: "Forgiving Yourself",
    dhikr:
      "SubhanAllah wa bihamdihi, astaghfirullah (Glory be to Allah and His praise, I seek forgiveness from Allah)",
    dua: {
      arabic: "رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي",
      transliteration: "Rabbi inni dhalamtu nafsi faghfir li",
      meaning: "My Lord, indeed I have wronged myself, so forgive me.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'All of the children of Adam are sinners, and the best sinners are those who repent.' (Tirmidhi)",
    reflectionPrompt:
      "Where have you been harder on yourself than Allah is on you? What would it look like to accept His forgiveness and stop replaying the guilt?",
  },
  {
    day: 13,
    theme: "Forgiving Others",
    dhikr:
      "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni (O Allah, You are Forgiving and love forgiveness, so forgive me)",
    dua: {
      arabic:
        "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِّلَّذِينَ آمَنُوا",
      transliteration:
        "Rabbanaghfir lana wa li-ikhwanina alladhina sabaquna bil-iman wa la taj'al fi qulubina ghillan lilladhina amanu",
      meaning:
        "Our Lord, forgive us and our brothers who preceded us in faith and put not in our hearts any resentment toward those who have believed.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Be merciful to others and you will receive mercy. Forgive others and Allah will forgive you.' (Ahmad)",
    reflectionPrompt:
      "Is there someone you are holding a grudge against? What would it mean for your own heart to release that burden — not for them, but for you and Allah?",
  },
  {
    day: 14,
    theme: "The Door of Tawbah",
    dhikr: "Ya Tawwab, Ya Ghaffar (O Acceptor of Repentance, O Ever-Forgiving)",
    dua: {
      arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
      transliteration: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
      meaning:
        "O Allah, You are Forgiving and love forgiveness, so forgive me.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Allah extends His Hand at night to accept the repentance of those who sinned during the day, and extends His Hand during the day to accept the repentance of those who sinned during the night.' (Muslim)",
    reflectionPrompt:
      "If Allah keeps the door of repentance open day and night, what keeps you from walking through it? What is the whisper that says you have gone too far?",
  },
  {
    day: 15,
    theme: "Forgiveness and the Nafs",
    dhikr:
      "A'udhu billahi min ash-shaytanir-rajim (I seek refuge in Allah from the accursed Satan)",
    dua: {
      arabic:
        "رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ",
      transliteration:
        "Rabbi a'udhu bika min hamazatish-shayatin wa a'udhu bika Rabbi an yahdurun",
      meaning:
        "My Lord, I seek refuge in You from the incitements of the devils, and I seek refuge in You, my Lord, lest they be present with me.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'The strong man is not the one who can wrestle, but the one who controls himself at the time of anger.' (Bukhari & Muslim)",
    reflectionPrompt:
      "Which tendencies of your nafs have been most exposed during this Ramadan? What pattern keeps recurring that you can now see more clearly?",
  },
  {
    day: 16,
    theme: "Forgiveness in the Night",
    dhikr:
      "SubhanAllah (33 times), Alhamdulillah (33 times), Allahu Akbar (34 times)",
    dua: {
      arabic:
        "اللَّهُمَّ إِنِّي أَعُوذُ بِرِضَاكَ مِنْ سَخَطِكَ وَبِمُعَافَاتِكَ مِنْ عُقُوبَتِكَ",
      transliteration:
        "Allahumma inni a'udhu bi-ridaka min sakhatika wa bi-mu'afatika min 'uqubatik",
      meaning:
        "O Allah, I seek refuge in Your pleasure from Your anger, and in Your pardon from Your punishment.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Our Lord descends every night to the lowest heaven when the last third of the night remains, saying: Who is calling upon Me so that I may answer? Who is asking of Me so that I may give? Who is seeking My forgiveness so that I may forgive?' (Bukhari & Muslim)",
    reflectionPrompt:
      "Have you tasted the sweetness of the last third of the night? What would it take to set an alarm and stand before Allah when the world is sleeping?",
  },
  {
    day: 17,
    theme: "The Weight of Small Sins",
    dhikr:
      "Astaghfirullaha wa atubu ilayh (I seek Allah's forgiveness and turn to Him in repentance)",
    dua: {
      arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا",
      transliteration: "Rabbana la tu'akhidhna in nasina aw akhta'na",
      meaning:
        "Our Lord, do not impose blame upon us if we forget or make a mistake.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Beware of the minor sins, for they accumulate until they destroy a person.' (Ahmad)",
    reflectionPrompt:
      "What small habits have you been dismissing as harmless? If they accumulated over years, what would they build into?",
  },
  {
    day: 18,
    theme: "Seeking Forgiveness for Parents",
    dhikr:
      "Rabbir hamhuma kama rabbayani saghira (My Lord, have mercy on them as they raised me when I was small)",
    dua: {
      arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
      transliteration: "Rabbir-hamhuma kama rabbayani saghira",
      meaning:
        "My Lord, have mercy upon my parents as they brought me up when I was small.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'The pleasure of the Lord is in the pleasure of the parent, and the displeasure of the Lord is in the displeasure of the parent.' (Tirmidhi)",
    reflectionPrompt:
      "When did you last make sincere dua for your parents? What unspoken gratitude or unresolved tension could you address this Ramadan?",
  },
  {
    day: 19,
    theme: "Forgiveness and Rizq",
    dhikr: "Ya Razzaq (O Provider)",
    dua: {
      arabic:
        "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
      transliteration:
        "Allahummak-fini bi-halalika 'an haramika wa aghnini bi-fadlika 'amman siwak",
      meaning:
        "O Allah, suffice me with what is lawful against what is unlawful, and make me independent of all besides You by Your bounty.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Whoever would like his provision to be expanded and his lifespan extended, let him maintain his family ties.' (Bukhari & Muslim)",
    reflectionPrompt:
      "How has your relationship with money, provision, and material comfort been affected by fasting? What does Ramadan teach you about real wealth?",
  },
  {
    day: 20,
    theme: "The Completeness of Forgiveness",
    dhikr:
      "Ya Ghafur, Ya Ghaffar, Ya 'Afuww (O Forgiving, O Ever-Forgiving, O Pardoner)",
    dua: {
      arabic:
        "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
      transliteration:
        "Rabbanaghfir li wa li-walidayya wa lil-mu'minina yawma yaqumul-hisab",
      meaning:
        "Our Lord, forgive me and my parents and the believers on the Day the account is established.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'If you were to commit sins until your sins filled the space between the heavens and earth, then you sought forgiveness from Allah, He would forgive you.' (Ibn Majah)",
    reflectionPrompt:
      "After ten days of seeking forgiveness, what has shifted inside you? Where do you feel lighter? Where do you still feel stuck?",
  },
  // =========================================================================
  // LAST TEN — FREEDOM FROM THE FIRE (Itq min an-Nar)
  // =========================================================================
  {
    day: 21,
    theme: "Seeking Laylatul Qadr",
    dhikr: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
    dua: {
      arabic:
        "اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
      transliteration:
        "Allahumma innaka 'afuwwun karimun tuhibbul 'afwa fa'fu 'anni",
      meaning:
        "O Allah, You are Pardoning and Generous, You love to pardon, so pardon me.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Seek Laylatul Qadr in the odd nights of the last ten days of Ramadan.' (Bukhari)",
    reflectionPrompt:
      "If tonight were Laylatul Qadr and every dua would be answered, what would you ask for? What does that answer reveal about where your heart truly is?",
  },
  {
    day: 22,
    theme: "Qiyam al-Layl",
    dhikr: "SubhanAllah wal-hamdulillah wa la ilaha illAllahu wallahu Akbar",
    dua: {
      arabic:
        "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      transliteration:
        "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
      meaning:
        "O Allah, help me to remember You, be grateful to You, and worship You in the best manner.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Whoever stands in prayer during Laylatul Qadr with faith and seeking reward, his past sins will be forgiven.' (Bukhari & Muslim)",
    reflectionPrompt:
      "What keeps you from standing in the night prayer? Is it your body, your nafs, or a whisper that tells you it will not make a difference?",
  },
  {
    day: 23,
    theme: "Freedom Through Tawakkul",
    dhikr:
      "Hasbunallahu wa ni'mal wakeel (Allah is sufficient for us and He is the best Disposer of affairs)",
    dua: {
      arabic:
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
      transliteration: "Allahumma inni as'alukal-'afiyata fid-dunya wal-akhira",
      meaning:
        "O Allah, I ask You for well-being in this world and the Hereafter.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'If you relied on Allah with true reliance, He would provide for you as He provides for the birds — they go out hungry in the morning and return full in the evening.' (Tirmidhi)",
    reflectionPrompt:
      "What outcome are you gripping too tightly? What would it look like to do your part, then truly hand the result to Allah?",
  },
  {
    day: 24,
    theme: "Freedom from Attachment to Dunya",
    dhikr:
      "La ilaha illAllah, wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir",
    dua: {
      arabic: "اللَّهُمَّ اجْعَلِ الْآخِرَةَ أَكْبَرَ هَمِّي",
      transliteration: "Allahummaj'al al-akhirata akbara hammi",
      meaning: "O Allah, make the Hereafter my greatest concern.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Be in this world as if you were a stranger or a traveler.' (Bukhari)",
    reflectionPrompt:
      "What part of the dunya has too much hold on your heart? If this life is a journey, what baggage can you set down?",
  },
  {
    day: 25,
    theme: "Freedom Through Ihsan",
    dhikr: "Ya Muhsin, ahsin ilayya (O Doer of Good, do good to me)",
    dua: {
      arabic:
        "اللَّهُمَّ اجْعَلْنِي مِنَ الْمُحْسِنِينَ وَاجْعَلْنِي مِنَ الصَّابِرِينَ",
      transliteration:
        "Allahummaj'alni minal-muhsinina waj'alni minas-sabireen",
      meaning:
        "O Allah, make me among the doers of good and make me among the patient.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Ihsan is to worship Allah as though you see Him; and if you cannot see Him, then indeed He sees you.' (Muslim)",
    reflectionPrompt:
      "If you lived as if Allah were watching every moment — not with fear but with love — what would change about today?",
  },
  {
    day: 26,
    theme: "Freedom from Despair",
    dhikr: "La taqnatu min rahmatillah (Do not despair of the mercy of Allah)",
    dua: {
      arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
      transliteration: "Rabbi la tadharnee fardan wa anta khayrul-waritheen",
      meaning:
        "My Lord, do not leave me alone, and You are the best of inheritors.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'No fatigue, illness, anxiety, sorrow, harm, or distress befalls a Muslim, even the pricking of a thorn, but Allah expiates some of his sins thereby.' (Bukhari & Muslim)",
    reflectionPrompt:
      "What pain have you been carrying that you assumed was pointless? What if every moment of that struggle was silently erasing sins and elevating your rank?",
  },
  {
    day: 27,
    theme: "The Night of Power",
    dhikr:
      "Allahu Akbar, Allahu Akbar, la ilaha illAllahu, wallahu Akbar, Allahu Akbar, wa lillahil-hamd",
    dua: {
      arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
      transliteration: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
      meaning: "O Allah, You are Pardoning and love to pardon, so pardon me.",
    },
    hadith:
      "Allah says in the Quran: 'Laylatul Qadr is better than a thousand months.' (Surah Al-Qadr, 97:3)",
    reflectionPrompt:
      "If this single night is worth more than a thousand months, how will you spend it? What dua will you repeat until Fajr?",
  },
  {
    day: 28,
    theme: "Freedom Through Sadaqah",
    dhikr:
      "Allahumma barik lana fima razaqtana (O Allah, bless us in what You have provided us)",
    dua: {
      arabic: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ",
      transliteration: "Rabbana taqabbal minna innaka antas-sami'ul-'alim",
      meaning:
        "Our Lord, accept from us. Indeed You are the All-Hearing, the All-Knowing.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Charity does not decrease wealth.' (Muslim)",
    reflectionPrompt:
      "What can you give beyond money? Your time, your forgiveness, your attention? What is the most generous thing you can do before Ramadan ends?",
  },
  {
    day: 29,
    theme: "Freedom Through Shukr",
    dhikr:
      "Alhamdulillah alladhi bi-ni'matihi tatimmous-salihat (Praise be to Allah, by Whose grace good deeds are completed)",
    dua: {
      arabic:
        "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      transliteration:
        "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
      meaning:
        "O Allah, help me to remember You, be grateful to You, and worship You in the best manner.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Whoever is not grateful for small things will not be grateful for great things.' (Ahmad)",
    reflectionPrompt:
      "As Ramadan nears its end, what are the three most meaningful moments of this month? What did Allah show you about yourself that you did not see before?",
  },
  {
    day: 30,
    theme: "Carrying Ramadan Forward",
    dhikr:
      "La ilaha illAllah Muhammadur-Rasulullah (There is no god but Allah, Muhammad is the Messenger of Allah)",
    dua: {
      arabic:
        "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
      transliteration:
        "Rabbana atmim lana noorana waghfir lana innaka 'ala kulli shay'in qadir",
      meaning:
        "Our Lord, perfect for us our light and forgive us. Indeed, You are over all things competent.",
    },
    hadith:
      "The Prophet (peace be upon him) said: 'Whoever fasts Ramadan and then follows it with six days of Shawwal, it is as if he fasted the entire year.' (Muslim)",
    reflectionPrompt:
      "What one practice from Ramadan will you carry into the rest of the year? Not five, not ten — just one. What is the promise you will make to Allah tonight?",
  },
];
