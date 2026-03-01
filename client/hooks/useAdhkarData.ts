import { useQuery } from "@tanstack/react-query";

export interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  reference: string;
  count: number; // recommended repetition count
  category:
    | "morning"
    | "evening"
    | "after-prayer"
    | "general"
    | "sleep"
    | "protection";
}

export interface AdhkarCategory {
  id: string;
  name: string;
  nameArabic: string;
  icon: string; // Feather icon name
  adhkar: Dhikr[];
}

// Comprehensive Adhkar Data Collection
const ADHKAR_DATA: AdhkarCategory[] = [
  {
    id: "morning",
    name: "Morning Adhkar",
    nameArabic: "أذكار الصباح",
    icon: "sunrise",
    adhkar: [
      {
        id: "morning-1",
        arabic:
          "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ، اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        transliteration:
          "A'udhu billahi minash-shaytanir-rajim. Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi shay'in min 'ilmihi illa bima sha'a. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adhim.",
        english:
          "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        reference: "Ayat al-Kursi (Qur'an 2:255)",
        count: 1,
        category: "morning",
      },
      {
        id: "morning-2",
        arabic:
          "بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration:
          "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i, wa Huwas-Sami'ul-'Alim.",
        english:
          "In the Name of Allah, with whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
        reference: "Abu Dawud 4/323, At-Tirmidhi 5/465",
        count: 3,
        category: "morning",
      },
      {
        id: "morning-3",
        arabic:
          "رَضِيتُ بِاللهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَى اللهُ عَلِيْهِ وَسَلَّمَ نَبِيًّا",
        transliteration:
          "Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin (sallallahu 'alayhi wa sallam) nabiyyan.",
        english:
          "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.",
        reference: "Abu Dawud 4/318, Ahmad 4/337",
        count: 3,
        category: "morning",
      },
      {
        id: "morning-4",
        arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
        transliteration: "Subhanallahi wa bihamdihi.",
        english: "Glory is to Allah and praise is to Him.",
        reference: "Al-Bukhari 7/168, Muslim 4/2071",
        count: 100,
        category: "morning",
      },
      {
        id: "morning-5",
        arabic:
          "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
        transliteration:
          "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir. Rabbi as'aluka khayra ma fi hadhal-yawm wa khayra ma ba'dahu, wa a'udhu bika min sharri ma fi hadhal-yawm wa sharri ma ba'dahu. Rabbi a'udhu bika minal-kasal, wa su'il-kibar. Rabbi a'udhu bika min 'adhabin fin-nar, wa 'adhabin fil-qabr.",
        english:
          "We have entered a new morning and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner. To Allah belongs the dominion, and to Him is the praise, and He is Able to do all things. My Lord, I ask You for the goodness of this day and the goodness that follows it, and I seek refuge in You from the evil of this day and the evil that follows it. My Lord, I seek refuge in You from laziness and the misery of old age. My Lord, I seek refuge in You from the punishment of the Fire and the punishment of the grave.",
        reference: "Muslim 4/2088",
        count: 1,
        category: "morning",
      },
      {
        id: "morning-6",
        arabic:
          "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        transliteration:
          "Allahumma inni asbahtu ushhiduka, wa ushhidu hamalata 'arshika, wa mala'ikataka, wa jami'a khalqika, annaka Antallahu la ilaha illa Anta wahdaka la sharika laka, wa anna Muhammadan 'abduka wa Rasuluk.",
        english:
          "O Allah, I have entered a new morning and I call upon You and upon the bearers of Your Throne, upon Your angels and all creation to bear witness that surely You are Allah, there is no god but You alone, You have no partners, and that Muhammad is Your slave and Your Messenger.",
        reference: "Abu Dawud 4/317",
        count: 4,
        category: "morning",
      },
      {
        id: "morning-7",
        arabic:
          "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        transliteration:
          "Allahumma ma asbaha bi min ni'matin aw bi-ahadin min khalqika faminka wahdaka la sharika lak, falakal-hamdu wa lakash-shukr.",
        english:
          "O Allah, whatever blessing has been received by me or anyone of Your creation is from You alone, You have no partner. All praise is for You and thanks is to You.",
        reference: "Abu Dawud 4/318",
        count: 1,
        category: "morning",
      },
    ],
  },
  {
    id: "evening",
    name: "Evening Adhkar",
    nameArabic: "أذكار المساء",
    icon: "sunset",
    adhkar: [
      {
        id: "evening-1",
        arabic:
          "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ، اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        transliteration:
          "A'udhu billahi minash-shaytanir-rajim. Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi shay'in min 'ilmihi illa bima sha'a. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adhim.",
        english:
          "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        reference: "Ayat al-Kursi (Qur'an 2:255)",
        count: 1,
        category: "evening",
      },
      {
        id: "evening-2",
        arabic:
          "بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration:
          "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i, wa Huwas-Sami'ul-'Alim.",
        english:
          "In the Name of Allah, with whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
        reference: "Abu Dawud 4/323, At-Tirmidhi 5/465",
        count: 3,
        category: "evening",
      },
      {
        id: "evening-3",
        arabic:
          "رَضِيتُ بِاللهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَى اللهُ عَلِيْهِ وَسَلَّمَ نَبِيًّا",
        transliteration:
          "Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin (sallallahu 'alayhi wa sallam) nabiyyan.",
        english:
          "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.",
        reference: "Abu Dawud 4/318, Ahmad 4/337",
        count: 3,
        category: "evening",
      },
      {
        id: "evening-4",
        arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
        transliteration: "Subhanallahi wa bihamdihi.",
        english: "Glory is to Allah and praise is to Him.",
        reference: "Al-Bukhari 7/168, Muslim 4/2071",
        count: 100,
        category: "evening",
      },
      {
        id: "evening-5",
        arabic:
          "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
        transliteration:
          "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir. Rabbi as'aluka khayra ma fi hadhihil-laylah wa khayra ma ba'daha, wa a'udhu bika min sharri ma fi hadhihil-laylah wa sharri ma ba'daha. Rabbi a'udhu bika minal-kasal, wa su'il-kibar. Rabbi a'udhu bika min 'adhabin fin-nar, wa 'adhabin fil-qabr.",
        english:
          "We have entered the evening and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner. To Allah belongs the dominion, and to Him is the praise, and He is Able to do all things. My Lord, I ask You for the goodness of this night and the goodness that follows it, and I seek refuge in You from the evil of this night and the evil that follows it. My Lord, I seek refuge in You from laziness and the misery of old age. My Lord, I seek refuge in You from the punishment of the Fire and the punishment of the grave.",
        reference: "Muslim 4/2088",
        count: 1,
        category: "evening",
      },
      {
        id: "evening-6",
        arabic:
          "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        transliteration:
          "Allahumma inni amsaytu ushhiduka, wa ushhidu hamalata 'arshika, wa mala'ikataka, wa jami'a khalqika, annaka Antallahu la ilaha illa Anta wahdaka la sharika laka, wa anna Muhammadan 'abduka wa Rasuluk.",
        english:
          "O Allah, I have entered the evening and I call upon You and upon the bearers of Your Throne, upon Your angels and all creation to bear witness that surely You are Allah, there is no god but You alone, You have no partners, and that Muhammad is Your slave and Your Messenger.",
        reference: "Abu Dawud 4/317",
        count: 4,
        category: "evening",
      },
      {
        id: "evening-7",
        arabic:
          "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        transliteration:
          "Allahumma ma amsa bi min ni'matin aw bi-ahadin min khalqika faminka wahdaka la sharika lak, falakal-hamdu wa lakash-shukr.",
        english:
          "O Allah, whatever blessing has been received by me or anyone of Your creation in this evening is from You alone, You have no partner. All praise is for You and thanks is to You.",
        reference: "Abu Dawud 4/318",
        count: 1,
        category: "evening",
      },
    ],
  },
  {
    id: "after-prayer",
    name: "After Prayer",
    nameArabic: "أذكار بعد الصلاة",
    icon: "book-open",
    adhkar: [
      {
        id: "after-prayer-1",
        arabic: "أَسْتَغْفِرُ اللهَ",
        transliteration: "Astaghfirullah.",
        english: "I seek the forgiveness of Allah.",
        reference: "Muslim 1/414",
        count: 3,
        category: "after-prayer",
      },
      {
        id: "after-prayer-2",
        arabic:
          "اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ",
        transliteration:
          "Allahumma Antas-Salam, wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
        english:
          "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.",
        reference: "Muslim 1/414",
        count: 1,
        category: "after-prayer",
      },
      {
        id: "after-prayer-3",
        arabic:
          "لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ، لاَ إِلَهَ إِلاَّ اللهُ، وَلاَ نَعْبُدُ إِلاَّ إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ، لاَ إِلَهَ إِلاَّ اللهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ",
        transliteration:
          "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir. La hawla wa la quwwata illa billah. La ilaha illallah, wa la na'budu illa iyyah. Lahun-ni'matu wa lahul-fadl, wa lahuth-thana'ul-hasan. La ilaha illallahu mukhlisina lahud-din wa law karihal-kafirun.",
        english:
          "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things. There is no power and no might except by Allah. None has the right to be worshipped but Allah, and we worship none but Him. His is grace, and His is bounty, and to Him belongs the most excellent praise. None has the right to be worshipped but Allah. We are sincere in making our religious devotion to Him, even though the disbelievers may dislike it.",
        reference: "Muslim 1/415",
        count: 1,
        category: "after-prayer",
      },
      {
        id: "after-prayer-4",
        arabic: "سُبْحَانَ اللهِ",
        transliteration: "Subhanallah.",
        english: "Glory is to Allah.",
        reference: "Al-Bukhari 1/255, Muslim 1/418",
        count: 33,
        category: "after-prayer",
      },
      {
        id: "after-prayer-5",
        arabic: "الْحَمْدُ للهِ",
        transliteration: "Alhamdulillah.",
        english: "Praise is to Allah.",
        reference: "Al-Bukhari 1/255, Muslim 1/418",
        count: 33,
        category: "after-prayer",
      },
      {
        id: "after-prayer-6",
        arabic: "اللهُ أَكْبَرُ",
        transliteration: "Allahu Akbar.",
        english: "Allah is the Greatest.",
        reference: "Al-Bukhari 1/255, Muslim 1/418",
        count: 34,
        category: "after-prayer",
      },
      {
        id: "after-prayer-7",
        arabic:
          "لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration:
          "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir.",
        english:
          "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.",
        reference: "Muslim 1/418",
        count: 1,
        category: "after-prayer",
      },
    ],
  },
  {
    id: "sleep",
    name: "Before Sleep",
    nameArabic: "أذكار النوم",
    icon: "moon",
    adhkar: [
      {
        id: "sleep-1",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya.",
        english: "O Allah, in Your Name I die and I live.",
        reference: "Al-Bukhari 7/71",
        count: 1,
        category: "sleep",
      },
      {
        id: "sleep-2",
        arabic:
          "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ، اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        transliteration:
          "A'udhu billahi minash-shaytanir-rajim. Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi shay'in min 'ilmihi illa bima sha'a. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adhim.",
        english:
          "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        reference: "Ayat al-Kursi (Qur'an 2:255)",
        count: 1,
        category: "sleep",
      },
      {
        id: "sleep-3",
        arabic:
          "قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        transliteration:
          "Qul Huwa Allahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.",
        english:
          "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
        reference: "Surah Al-Ikhlas (Qur'an 112)",
        count: 3,
        category: "sleep",
      },
      {
        id: "sleep-4",
        arabic:
          "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        transliteration:
          "Qul a'udhu bi-Rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
        english:
          "Say: I seek refuge in the Lord of daybreak, from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.",
        reference: "Surah Al-Falaq (Qur'an 113)",
        count: 3,
        category: "sleep",
      },
      {
        id: "sleep-5",
        arabic:
          "قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَ النَّاسِ",
        transliteration:
          "Qul a'udhu bi-Rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.",
        english:
          "Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer, who whispers into the breasts of mankind, from among the jinn and mankind.",
        reference: "Surah An-Nas (Qur'an 114)",
        count: 3,
        category: "sleep",
      },
      {
        id: "sleep-6",
        arabic:
          "اللَّهُمَّ إِنِّي أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
        transliteration:
          "Allahumma inni aslamtu nafsi ilayk, wa fawwadtu amri ilayk, wa wajjahtu wajhi ilayk, wa alja'tu dhahri ilayk, raghbatan wa rahbatan ilayk. La malja'a wa la manja minka illa ilayk. Amantu bikitabikal-ladhi anzalt, wa binabiyyikal-ladhi arsalt.",
        english:
          "O Allah, I submit myself to You, entrust my affairs to You, turn my face to You, and lay myself down depending upon You, hoping in You and fearing You. There is no refuge, and no escape, except to You. I believe in Your Book that You revealed, and the Prophet whom You sent.",
        reference: "Al-Bukhari 7/71, Muslim 4/2081",
        count: 1,
        category: "sleep",
      },
      {
        id: "sleep-7",
        arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak.",
        english:
          "O Allah, protect me from Your punishment on the Day You resurrect Your slaves.",
        reference: "Abu Dawud 4/311",
        count: 3,
        category: "sleep",
      },
    ],
  },
  {
    id: "protection",
    name: "Protection",
    nameArabic: "أذكار الحماية",
    icon: "shield",
    adhkar: [
      {
        id: "protection-1",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration:
          "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
        english:
          "I seek refuge in the Perfect Words of Allah from the evil of what He has created.",
        reference: "Muslim 4/2080, Ahmad 2/290",
        count: 3,
        category: "protection",
      },
      {
        id: "protection-2",
        arabic:
          "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
        transliteration:
          "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal, wa a'udhu bika minal-jubni wal-bukhl, wa a'udhu bika min ghalabatid-dayni wa qahrir-rijal.",
        english:
          "O Allah, I seek refuge in You from worry and grief, from helplessness and laziness, from cowardice and miserliness, and from being overpowered by debt and from the oppression of men.",
        reference: "Al-Bukhari 7/158",
        count: 1,
        category: "protection",
      },
      {
        id: "protection-3",
        arabic:
          "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ",
        transliteration:
          "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa Ant.",
        english:
          "O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight. There is no god but You.",
        reference: "Abu Dawud 4/324",
        count: 3,
        category: "protection",
      },
      {
        id: "protection-4",
        arabic:
          "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ",
        transliteration:
          "Allahumma inni a'udhu bika minal-kufri wal-faqr, wa a'udhu bika min 'adhabil-qabr, la ilaha illa Ant.",
        english:
          "O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. There is no god but You.",
        reference: "Abu Dawud 4/324",
        count: 3,
        category: "protection",
      },
      {
        id: "protection-5",
        arabic:
          "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        transliteration:
          "Hasbiyallahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adhim.",
        english:
          "Allah is sufficient for me. There is no god but Him. In Him I put my trust, and He is the Lord of the Mighty Throne.",
        reference: "Abu Dawud 4/321, Ibn As-Sunni (no. 71)",
        count: 7,
        category: "protection",
      },
      {
        id: "protection-6",
        arabic:
          "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
        transliteration:
          "Allahumma inni as'alukal-'afiyah fid-dunya wal-akhirah. Allahumma inni as'alukal-'afwa wal-'afiyah fi dini wa dunyaya wa ahli wa mali. Allahummastir 'awrati wa amin raw'ati. Allahummahfadhni min bayni yaday, wa min khalfi, wa 'an yamini, wa 'an shimali, wa min fawqi, wa a'udhu bi'adhamatika an ughtala min tahti.",
        english:
          "O Allah, I ask You for well-being in this world and the next. O Allah, I ask You for forgiveness and well-being in my religion, my worldly affairs, my family, and my wealth. O Allah, conceal my faults and calm my fears. O Allah, guard me from in front of me and behind me, from my right and my left, and from above me. I seek refuge in Your Greatness from being unexpectedly destroyed from beneath me.",
        reference: "Abu Dawud 4/326, Ibn Majah 2/332",
        count: 1,
        category: "protection",
      },
      {
        id: "protection-7",
        arabic:
          "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        transliteration:
          "Ya Hayyu ya Qayyum, birahmatika astagheeth, aslih li sha'ni kullah, wa la takilni ila nafsi tarfata 'ayn.",
        english:
          "O Ever-Living, O Sustainer, by Your mercy I seek help. Set right all my affairs and do not leave me to myself even for the blink of an eye.",
        reference: "Sahih At-Targhib wat-Tarhib 1/273",
        count: 1,
        category: "protection",
      },
    ],
  },
  {
    id: "general",
    name: "General Dhikr",
    nameArabic: "أذكار عامة",
    icon: "heart",
    adhkar: [
      {
        id: "general-1",
        arabic:
          "لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration:
          "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir.",
        english:
          "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.",
        reference: "Al-Bukhari 4/95, Muslim 4/2071",
        count: 100,
        category: "general",
      },
      {
        id: "general-2",
        arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيمِ",
        transliteration: "Subhanallahi wa bihamdihi, Subhanallahil-'Adhim.",
        english:
          "Glory is to Allah and praise is to Him. Glory is to Allah, the Most Great.",
        reference: "Al-Bukhari, Muslim",
        count: 10,
        category: "general",
      },
      {
        id: "general-3",
        arabic: "أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ",
        transliteration: "Astaghfirullaha wa atubu ilayh.",
        english: "I seek the forgiveness of Allah and repent to Him.",
        reference: "Al-Bukhari 7/168",
        count: 100,
        category: "general",
      },
      {
        id: "general-4",
        arabic:
          "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
        transliteration:
          "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid.",
        english:
          "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
        reference: "Al-Bukhari 4/118, Muslim 1/305",
        count: 10,
        category: "general",
      },
      {
        id: "general-5",
        arabic: "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ",
        transliteration: "La hawla wa la quwwata illa billah.",
        english: "There is no power and no strength except by Allah.",
        reference: "Al-Bukhari, Muslim",
        count: 10,
        category: "general",
      },
      {
        id: "general-6",
        arabic:
          "سُبْحَانَ اللهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللهُ، وَاللهُ أَكْبَرُ",
        transliteration:
          "Subhanallah, walhamdulillah, wa la ilaha illallah, wallahu akbar.",
        english:
          "Glory is to Allah, and praise is to Allah, and there is no god but Allah, and Allah is the Greatest.",
        reference: "Muslim 4/2072, At-Tirmidhi 5/511",
        count: 25,
        category: "general",
      },
      {
        id: "general-7",
        arabic: "رَبِّ اغْفِرْ لِي",
        transliteration: "Rabbighfir li.",
        english: "My Lord, forgive me.",
        reference: "Ibn Majah 2/1263",
        count: 100,
        category: "general",
      },
    ],
  },
];

/**
 * Hook to get all adhkar categories
 */
export function useAdhkarCategories() {
  return useQuery({
    queryKey: ["adhkar-categories"],
    queryFn: () => Promise.resolve(ADHKAR_DATA),
    staleTime: Infinity, // Data never goes stale (offline-first)
    gcTime: Infinity, // Keep in cache indefinitely
  });
}

/**
 * Hook to get adhkar for a specific category
 */
export function useAdhkarByCategory(categoryId: string) {
  return useQuery({
    queryKey: ["adhkar-category", categoryId],
    queryFn: () => {
      const category = ADHKAR_DATA.find((cat) => cat.id === categoryId);
      if (!category) {
        throw new Error(`Category with id ${categoryId} not found`);
      }
      return Promise.resolve(category);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!categoryId,
  });
}

/**
 * Hook to get daily adhkar (morning or evening) based on current time
 * Morning: 6:00 AM - 12:00 PM
 * Evening: 6:00 PM - 12:00 AM
 */
export function useDailyAdhkar() {
  return useQuery({
    queryKey: ["daily-adhkar"],
    queryFn: () => {
      const currentHour = new Date().getHours();

      // Determine if it's morning or evening time
      let categoryId: "morning" | "evening";

      if (currentHour >= 6 && currentHour < 12) {
        // Morning time (6 AM - 12 PM)
        categoryId = "morning";
      } else if (currentHour >= 18 || currentHour < 6) {
        // Evening time (6 PM - 6 AM)
        categoryId = "evening";
      } else {
        // Default to evening for afternoon hours
        categoryId = "evening";
      }

      const category = ADHKAR_DATA.find((cat) => cat.id === categoryId);

      return Promise.resolve({
        category: category!,
        timeOfDay: categoryId,
        currentHour,
      });
    },
    staleTime: 1000 * 60 * 5, // Refetch every 5 minutes to update time-based logic
    gcTime: Infinity,
  });
}

/**
 * Helper function to get a single dhikr by ID across all categories
 */
export function useDhikrById(dhikrId: string) {
  return useQuery({
    queryKey: ["dhikr", dhikrId],
    queryFn: () => {
      for (const category of ADHKAR_DATA) {
        const dhikr = category.adhkar.find((d) => d.id === dhikrId);
        if (dhikr) {
          return Promise.resolve({ dhikr, category });
        }
      }
      throw new Error(`Dhikr with id ${dhikrId} not found`);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!dhikrId,
  });
}

/**
 * Helper function to search adhkar by keyword
 */
export function useSearchAdhkar(searchQuery: string) {
  return useQuery({
    queryKey: ["adhkar-search", searchQuery],
    queryFn: () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return Promise.resolve([]);
      }

      const query = searchQuery.toLowerCase();
      const results: { dhikr: Dhikr; category: AdhkarCategory }[] = [];

      ADHKAR_DATA.forEach((category) => {
        category.adhkar.forEach((dhikr) => {
          const searchableText = [
            dhikr.arabic,
            dhikr.transliteration,
            dhikr.english,
            dhikr.reference,
            category.name,
            category.nameArabic,
          ]
            .join(" ")
            .toLowerCase();

          if (searchableText.includes(query)) {
            results.push({ dhikr, category });
          }
        });
      });

      return Promise.resolve(results);
    },
    staleTime: 1000 * 60, // 1 minute
    enabled: !!searchQuery && searchQuery.trim().length >= 2,
  });
}
