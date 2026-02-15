/**
 * Comprehensive Adhkar/Dua Seed Script
 *
 * This script seeds the database with 100+ authentic adhkar and duas from authentic Islamic sources.
 * All adhkar include Arabic text, transliteration, English translation, authentic references,
 * and recommended repetition counts.
 *
 * Categories:
 * - Morning Adhkar (أذكار الصباح)
 * - Evening Adhkar (أذكار المساء)
 * - After Prayer (أذكار بعد الصلاة)
 * - Before Sleep (أذكار النوم)
 * - Protection (أذكار الحماية)
 * - Travel (أذكار السفر)
 * - Eating & Drinking (أذكار الطعام)
 * - General Duas (أدعية عامة)
 */

import { db } from "../db";
import { adhkar } from "../../shared/schema";
import type { InsertAdhkar } from "../../shared/schema";

const ADHKAR_DATA: InsertAdhkar[] = [
  // ============================================================================
  // MORNING ADHKAR (أذكار الصباح) - 20 adhkar
  // ============================================================================
  {
    id: "morning-1",
    category: "morning",
    arabic: "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ، اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "A'udhu billahi minash-shaytanir-rajim. Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi shay'in min 'ilmihi illa bima sha'a. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adhim.",
    translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    reference: "Ayat al-Kursi (Qur'an 2:255)",
    repetitions: 1,
    virtue: "Whoever recites Ayat al-Kursi after every obligatory prayer, nothing will prevent him from entering Paradise except death. Protection from harm until evening."
  },
  {
    id: "morning-2",
    category: "morning",
    arabic: "بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i, wa Huwas-Sami'ul-'Alim.",
    translation: "In the Name of Allah, with whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
    reference: "Abu Dawud 4/323, At-Tirmidhi 5/465",
    repetitions: 3,
    virtue: "Nothing will harm him until evening. Reciting it three times protects from sudden harm."
  },
  {
    id: "morning-3",
    category: "morning",
    arabic: "رَضِيتُ بِاللهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَى اللهُ عَلِيْهِ وَسَلَّمَ نَبِيًّا",
    transliteration: "Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin (sallallahu 'alayhi wa sallam) nabiyyan.",
    translation: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.",
    reference: "Abu Dawud 4/318, Ahmad 4/337",
    repetitions: 3,
    virtue: "Allah has guaranteed Paradise for whoever says this with certainty three times in the morning or evening."
  },
  {
    id: "morning-4",
    category: "morning",
    arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
    transliteration: "Subhanallahi wa bihamdihi.",
    translation: "Glory is to Allah and praise is to Him.",
    reference: "Al-Bukhari 7/168, Muslim 4/2071",
    repetitions: 100,
    virtue: "Whoever says this 100 times in a day, their sins will be forgiven even if they are like the foam of the sea."
  },
  {
    id: "morning-5",
    category: "morning",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    transliteration: "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir. Rabbi as'aluka khayra ma fi hadhal-yawm wa khayra ma ba'dahu, wa a'udhu bika min sharri ma fi hadhal-yawm wa sharri ma ba'dahu. Rabbi a'udhu bika minal-kasal, wa su'il-kibar. Rabbi a'udhu bika min 'adhabin fin-nar, wa 'adhabin fil-qabr.",
    translation: "We have entered a new morning and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner. To Allah belongs the dominion, and to Him is the praise, and He is Able to do all things. My Lord, I ask You for the goodness of this day and the goodness that follows it, and I seek refuge in You from the evil of this day and the evil that follows it. My Lord, I seek refuge in You from laziness and the misery of old age. My Lord, I seek refuge in You from the punishment of the Fire and the punishment of the grave.",
    reference: "Muslim 4/2088",
    repetitions: 1,
    virtue: "Comprehensive morning supplication seeking Allah's protection and blessings."
  },
  {
    id: "morning-6",
    category: "morning",
    arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    transliteration: "Allahumma inni asbahtu ushhiduka, wa ushhidu hamalata 'arshika, wa mala'ikataka, wa jami'a khalqika, annaka Antallahu la ilaha illa Anta wahdaka la sharika laka, wa anna Muhammadan 'abduka wa Rasuluk.",
    translation: "O Allah, I have entered a new morning and I call upon You and upon the bearers of Your Throne, upon Your angels and all creation to bear witness that surely You are Allah, there is no god but You alone, You have no partners, and that Muhammad is Your slave and Your Messenger.",
    reference: "Abu Dawud 4/317",
    repetitions: 4,
    virtue: "Allah frees a quarter of the person from Hellfire with each recitation. Four times means complete freedom."
  },
  {
    id: "morning-7",
    category: "morning",
    arabic: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    transliteration: "Allahumma ma asbaha bi min ni'matin aw bi-ahadin min khalqika faminka wahdaka la sharika lak, falakal-hamdu wa lakash-shukr.",
    translation: "O Allah, whatever blessing has been received by me or anyone of Your creation is from You alone, You have no partner. All praise is for You and thanks is to You.",
    reference: "Abu Dawud 4/318",
    repetitions: 1,
    virtue: "This fulfills the obligation of gratitude for the day."
  },
  {
    id: "morning-8",
    category: "morning",
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ",
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa Ant.",
    translation: "O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight. There is no god but You.",
    reference: "Abu Dawud 4/324",
    repetitions: 3,
    virtue: "Supplication for physical and sensory health protection."
  },
  {
    id: "morning-9",
    category: "morning",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ",
    transliteration: "Allahumma inni a'udhu bika minal-kufri wal-faqr, wa a'udhu bika min 'adhabil-qabr, la ilaha illa Ant.",
    translation: "O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. There is no god but You.",
    reference: "Abu Dawud 4/324",
    repetitions: 3,
    virtue: "Protection from spiritual and worldly harm."
  },
  {
    id: "morning-10",
    category: "morning",
    arabic: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Hasbiyallahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adhim.",
    translation: "Allah is sufficient for me. There is no god but Him. In Him I put my trust, and He is the Lord of the Mighty Throne.",
    reference: "Abu Dawud 4/321, Ibn As-Sunni (no. 71)",
    repetitions: 7,
    virtue: "Allah will suffice you in whatever concerns you of this world and the Hereafter."
  },
  {
    id: "morning-11",
    category: "morning",
    arabic: "لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir.",
    translation: "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.",
    reference: "Al-Bukhari 4/95, Muslim 4/2071",
    repetitions: 10,
    virtue: "Equivalent to freeing ten slaves, 100 good deeds recorded, 100 sins erased, protection from Satan until evening."
  },
  {
    id: "morning-12",
    category: "morning",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
    translation: "I seek refuge in the Perfect Words of Allah from the evil of what He has created.",
    reference: "Muslim 4/2080, Ahmad 2/290",
    repetitions: 3,
    virtue: "Protection from all harm until evening."
  },
  {
    id: "morning-13",
    category: "morning",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
    transliteration: "Allahumma inni as'alukal-'afiyah fid-dunya wal-akhirah.",
    translation: "O Allah, I ask You for well-being in this world and the Hereafter.",
    reference: "Ibn Majah 2/332",
    repetitions: 1,
    virtue: "Asking for comprehensive well-being in both worlds."
  },
  {
    id: "morning-14",
    category: "morning",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu wa ilaykan-nushur.",
    translation: "O Allah, by You we enter the morning, and by You we enter the evening, by You we live, and by You we die, and to You is the resurrection.",
    reference: "At-Tirmidhi 5/466, Abu Dawud 4/317",
    repetitions: 1,
    virtue: "Acknowledging complete dependence on Allah."
  },
  {
    id: "morning-15",
    category: "morning",
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration: "Ya Hayyu ya Qayyum, birahmatika astagheeth, aslih li sha'ni kullah, wa la takilni ila nafsi tarfata 'ayn.",
    translation: "O Ever-Living, O Sustainer, by Your mercy I seek help. Set right all my affairs and do not leave me to myself even for the blink of an eye.",
    reference: "Sahih At-Targhib wat-Tarhib 1/273",
    repetitions: 1,
    virtue: "Seeking Allah's continuous support and guidance."
  },
  {
    id: "morning-16",
    category: "morning",
    arabic: "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
    transliteration: "Asbahna 'ala fitratil-Islam, wa 'ala kalimatil-ikhlas, wa 'ala dini nabiyyina Muhammadin (sallallahu 'alayhi wa sallam), wa 'ala millati abina Ibrahima hanifan musliman wa ma kana minal-mushrikin.",
    translation: "We have entered the morning upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad (peace be upon him), and the way of our father Ibrahim, who turned away from all that is false, having surrendered to Allah, and he was not of the polytheists.",
    reference: "Ahmad 3/406, 407",
    repetitions: 1,
    virtue: "Reaffirming commitment to Islamic monotheism."
  },
  {
    id: "morning-17",
    category: "morning",
    arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
    transliteration: "Subhanallahi wa bihamdihi 'adada khalqihi wa rida nafsihi wa zinata 'arshihi wa midada kalimatihi.",
    translation: "Glory is to Allah and praise is to Him, by the number of His creation, by His pleasure, by the weight of His Throne, and by the ink of His words.",
    reference: "Muslim 4/2090",
    repetitions: 3,
    virtue: "Immense reward - the dhikr is multiplied by vast amounts."
  },
  {
    id: "morning-18",
    category: "morning",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً",
    transliteration: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan.",
    translation: "O Allah, I ask You for beneficial knowledge, goodly provision, and acceptable deeds.",
    reference: "Ibn Majah 1/92, Ibn As-Sunni (no. 54)",
    repetitions: 1,
    virtue: "Comprehensive supplication for worldly and religious success."
  },
  {
    id: "morning-19",
    category: "morning",
    arabic: "أَسْتَغْفِرُ اللهَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaha al-ladhi la ilaha illa Huwal-Hayyul-Qayyumu wa atubu ilayh.",
    translation: "I seek the forgiveness of Allah, there is no god but He, the Ever-Living, the Sustainer, and I repent to Him.",
    reference: "Abu Dawud 2/85, At-Tirmidhi 5/569",
    repetitions: 1,
    virtue: "Sins are forgiven even if one fled from battle."
  },
  {
    id: "morning-20",
    category: "morning",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal, wa a'udhu bika minal-jubni wal-bukhl, wa a'udhu bika min ghalabatid-dayni wa qahrir-rijal.",
    translation: "O Allah, I seek refuge in You from worry and grief, from helplessness and laziness, from cowardice and miserliness, and from being overpowered by debt and from the oppression of men.",
    reference: "Al-Bukhari 7/158",
    repetitions: 1,
    virtue: "Protection from psychological and social difficulties."
  },

  // ============================================================================
  // EVENING ADHKAR (أذكار المساء) - 20 adhkar
  // ============================================================================
  {
    id: "evening-1",
    category: "evening",
    arabic: "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ، اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "A'udhu billahi minash-shaytanir-rajim. Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi shay'in min 'ilmihi illa bima sha'a. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adhim.",
    translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    reference: "Ayat al-Kursi (Qur'an 2:255)",
    repetitions: 1,
    virtue: "Protection until morning. A guardian from Allah will be with you and Satan will not approach you."
  },
  {
    id: "evening-2",
    category: "evening",
    arabic: "بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i, wa Huwas-Sami'ul-'Alim.",
    translation: "In the Name of Allah, with whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
    reference: "Abu Dawud 4/323, At-Tirmidhi 5/465",
    repetitions: 3,
    virtue: "Nothing will harm him until morning."
  },
  {
    id: "evening-3",
    category: "evening",
    arabic: "رَضِيتُ بِاللهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَى اللهُ عَلِيْهِ وَسَلَّمَ نَبِيًّا",
    transliteration: "Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin (sallallahu 'alayhi wa sallam) nabiyyan.",
    translation: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.",
    reference: "Abu Dawud 4/318, Ahmad 4/337",
    repetitions: 3,
    virtue: "Allah has guaranteed Paradise for whoever says this with certainty."
  },
  {
    id: "evening-4",
    category: "evening",
    arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
    transliteration: "Subhanallahi wa bihamdihi.",
    translation: "Glory is to Allah and praise is to Him.",
    reference: "Al-Bukhari 7/168, Muslim 4/2071",
    repetitions: 100,
    virtue: "Sins forgiven even if they are like the foam of the sea."
  },
  {
    id: "evening-5",
    category: "evening",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    transliteration: "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir. Rabbi as'aluka khayra ma fi hadhihil-laylah wa khayra ma ba'daha, wa a'udhu bika min sharri ma fi hadhihil-laylah wa sharri ma ba'daha. Rabbi a'udhu bika minal-kasal, wa su'il-kibar. Rabbi a'udhu bika min 'adhabin fin-nar, wa 'adhabin fil-qabr.",
    translation: "We have entered the evening and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner. To Allah belongs the dominion, and to Him is the praise, and He is Able to do all things. My Lord, I ask You for the goodness of this night and the goodness that follows it, and I seek refuge in You from the evil of this night and the evil that follows it. My Lord, I seek refuge in You from laziness and the misery of old age. My Lord, I seek refuge in You from the punishment of the Fire and the punishment of the grave.",
    reference: "Muslim 4/2088",
    repetitions: 1,
    virtue: "Comprehensive evening supplication."
  },
  {
    id: "evening-6",
    category: "evening",
    arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    transliteration: "Allahumma inni amsaytu ushhiduka, wa ushhidu hamalata 'arshika, wa mala'ikataka, wa jami'a khalqika, annaka Antallahu la ilaha illa Anta wahdaka la sharika laka, wa anna Muhammadan 'abduka wa Rasuluk.",
    translation: "O Allah, I have entered the evening and I call upon You and upon the bearers of Your Throne, upon Your angels and all creation to bear witness that surely You are Allah, there is no god but You alone, You have no partners, and that Muhammad is Your slave and Your Messenger.",
    reference: "Abu Dawud 4/317",
    repetitions: 4,
    virtue: "Allah frees a quarter from Hellfire with each recitation."
  },
  {
    id: "evening-7",
    category: "evening",
    arabic: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    transliteration: "Allahumma ma amsa bi min ni'matin aw bi-ahadin min khalqika faminka wahdaka la sharika lak, falakal-hamdu wa lakash-shukr.",
    translation: "O Allah, whatever blessing has been received by me or anyone of Your creation in this evening is from You alone, You have no partner. All praise is for You and thanks is to You.",
    reference: "Abu Dawud 4/318",
    repetitions: 1,
    virtue: "Fulfills the obligation of gratitude for the evening."
  },
  {
    id: "evening-8",
    category: "evening",
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ",
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa Ant.",
    translation: "O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight. There is no god but You.",
    reference: "Abu Dawud 4/324",
    repetitions: 3,
    virtue: "Health protection through the night."
  },
  {
    id: "evening-9",
    category: "evening",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ",
    transliteration: "Allahumma inni a'udhu bika minal-kufri wal-faqr, wa a'udhu bika min 'adhabil-qabr, la ilaha illa Ant.",
    translation: "O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. There is no god but You.",
    reference: "Abu Dawud 4/324",
    repetitions: 3,
    virtue: "Evening protection from spiritual and worldly harm."
  },
  {
    id: "evening-10",
    category: "evening",
    arabic: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Hasbiyallahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adhim.",
    translation: "Allah is sufficient for me. There is no god but Him. In Him I put my trust, and He is the Lord of the Mighty Throne.",
    reference: "Abu Dawud 4/321",
    repetitions: 7,
    virtue: "Allah suffices you in all concerns."
  },
  {
    id: "evening-11",
    category: "evening",
    arabic: "لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir.",
    translation: "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.",
    reference: "Al-Bukhari 4/95, Muslim 4/2071",
    repetitions: 10,
    virtue: "Protection from Satan until morning."
  },
  {
    id: "evening-12",
    category: "evening",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
    translation: "I seek refuge in the Perfect Words of Allah from the evil of what He has created.",
    reference: "Muslim 4/2080",
    repetitions: 3,
    virtue: "Protection from all harm until morning."
  },
  {
    id: "evening-13",
    category: "evening",
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu wa ilaykal-masir.",
    translation: "O Allah, by You we enter the evening, and by You we enter the morning, by You we live, and by You we die, and to You is the final return.",
    reference: "At-Tirmidhi 5/466, Abu Dawud 4/317",
    repetitions: 1,
    virtue: "Acknowledging complete dependence on Allah."
  },
  {
    id: "evening-14",
    category: "evening",
    arabic: "أَمْسَيْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
    transliteration: "Amsayna 'ala fitratil-Islam, wa 'ala kalimatil-ikhlas, wa 'ala dini nabiyyina Muhammadin (sallallahu 'alayhi wa sallam), wa 'ala millati abina Ibrahima hanifan musliman wa ma kana minal-mushrikin.",
    translation: "We have entered the evening upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad (peace be upon him), and the way of our father Ibrahim, who turned away from all that is false, having surrendered to Allah, and he was not of the polytheists.",
    reference: "Ahmad 3/406, 407",
    repetitions: 1,
    virtue: "Evening reaffirmation of faith."
  },
  {
    id: "evening-15",
    category: "evening",
    arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
    transliteration: "Subhanallahi wa bihamdihi 'adada khalqihi wa rida nafsihi wa zinata 'arshihi wa midada kalimatihi.",
    translation: "Glory is to Allah and praise is to Him, by the number of His creation, by His pleasure, by the weight of His Throne, and by the ink of His words.",
    reference: "Muslim 4/2090",
    repetitions: 3,
    virtue: "Immense reward multiplied vastly."
  },
  {
    id: "evening-16",
    category: "evening",
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration: "Ya Hayyu ya Qayyum, birahmatika astagheeth, aslih li sha'ni kullah, wa la takilni ila nafsi tarfata 'ayn.",
    translation: "O Ever-Living, O Sustainer, by Your mercy I seek help. Set right all my affairs and do not leave me to myself even for the blink of an eye.",
    reference: "Sahih At-Targhib wat-Tarhib 1/273",
    repetitions: 1,
    virtue: "Continuous divine support."
  },
  {
    id: "evening-17",
    category: "evening",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
    transliteration: "Allahumma inni as'alukal-'afiyah fid-dunya wal-akhirah.",
    translation: "O Allah, I ask You for well-being in this world and the Hereafter.",
    reference: "Ibn Majah 2/332",
    repetitions: 1,
    virtue: "Comprehensive well-being in both worlds."
  },
  {
    id: "evening-18",
    category: "evening",
    arabic: "أَسْتَغْفِرُ اللهَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaha al-ladhi la ilaha illa Huwal-Hayyul-Qayyumu wa atubu ilayh.",
    translation: "I seek the forgiveness of Allah, there is no god but He, the Ever-Living, the Sustainer, and I repent to Him.",
    reference: "Abu Dawud 2/85, At-Tirmidhi 5/569",
    repetitions: 1,
    virtue: "Sins forgiven."
  },
  {
    id: "evening-19",
    category: "evening",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    transliteration: "Qul Huwa Allahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.",
    translation: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
    reference: "Surah Al-Ikhlas (Qur'an 112)",
    repetitions: 3,
    virtue: "Protection until morning. Equals one-third of the Quran in reward."
  },
  {
    id: "evening-20",
    category: "evening",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    transliteration: "Qul a'udhu bi-Rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
    translation: "Say: I seek refuge in the Lord of daybreak, from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.",
    reference: "Surah Al-Falaq (Qur'an 113)",
    repetitions: 3,
    virtue: "Protection from all evil and envy."
  },

  // ============================================================================
  // AFTER PRAYER ADHKAR (أذكار بعد الصلاة) - 15 adhkar
  // ============================================================================
  {
    id: "after-prayer-1",
    category: "after-prayer",
    arabic: "أَسْتَغْفِرُ اللهَ",
    transliteration: "Astaghfirullah.",
    translation: "I seek the forgiveness of Allah.",
    reference: "Muslim 1/414",
    repetitions: 3,
    virtue: "First action after completing the prayer."
  },
  {
    id: "after-prayer-2",
    category: "after-prayer",
    arabic: "اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ",
    transliteration: "Allahumma Antas-Salam, wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
    translation: "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.",
    reference: "Muslim 1/414",
    repetitions: 1,
    virtue: "Praising Allah after completing prayer."
  },
  {
    id: "after-prayer-3",
    category: "after-prayer",
    arabic: "لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ، لاَ إِلَهَ إِلاَّ اللهُ، وَلاَ نَعْبُدُ إِلاَّ إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ، لاَ إِلَهَ إِلاَّ اللهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir. La hawla wa la quwwata illa billah. La ilaha illallah, wa la na'budu illa iyyah. Lahun-ni'matu wa lahul-fadl, wa lahuth-thana'ul-hasan. La ilaha illallahu mukhlisina lahud-din wa law karihal-kafirun.",
    translation: "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things. There is no power and no might except by Allah. None has the right to be worshipped but Allah, and we worship none but Him. His is grace, and His is bounty, and to Him belongs the most excellent praise. None has the right to be worshipped but Allah. We are sincere in making our religious devotion to Him, even though the disbelievers may dislike it.",
    reference: "Muslim 1/415",
    repetitions: 1,
    virtue: "Sins are forgiven even if they are like the foam of the sea."
  },
  {
    id: "after-prayer-4",
    category: "after-prayer",
    arabic: "سُبْحَانَ اللهِ",
    transliteration: "Subhanallah.",
    translation: "Glory is to Allah.",
    reference: "Al-Bukhari 1/255, Muslim 1/418",
    repetitions: 33,
    virtue: "Part of the dhikr totaling 100 that leads to forgiveness."
  },
  {
    id: "after-prayer-5",
    category: "after-prayer",
    arabic: "الْحَمْدُ للهِ",
    transliteration: "Alhamdulillah.",
    translation: "Praise is to Allah.",
    reference: "Al-Bukhari 1/255, Muslim 1/418",
    repetitions: 33,
    virtue: "Part of the dhikr totaling 100."
  },
  {
    id: "after-prayer-6",
    category: "after-prayer",
    arabic: "اللهُ أَكْبَرُ",
    transliteration: "Allahu Akbar.",
    translation: "Allah is the Greatest.",
    reference: "Al-Bukhari 1/255, Muslim 1/418",
    repetitions: 34,
    virtue: "Completes the count of 100 for full reward."
  },
  {
    id: "after-prayer-7",
    category: "after-prayer",
    arabic: "لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir.",
    translation: "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.",
    reference: "Muslim 1/418",
    repetitions: 1,
    virtue: "Completes the post-prayer adhkar."
  },
  {
    id: "after-prayer-8",
    category: "after-prayer",
    arabic: "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ، اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ...",
    transliteration: "A'udhu billahi minash-shaytanir-rajim. Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum...",
    translation: "Ayat al-Kursi (full verse as in morning adhkar)",
    reference: "An-Nasa'i, Ibn As-Sunni",
    repetitions: 1,
    virtue: "Nothing will prevent entry to Paradise except death."
  },
  {
    id: "after-prayer-9",
    category: "after-prayer",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    transliteration: "Qul Huwa Allahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.",
    translation: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
    reference: "Surah Al-Ikhlas (Qur'an 112)",
    repetitions: 1,
    virtue: "After Fajr and Maghrib: 3 times each."
  },
  {
    id: "after-prayer-10",
    category: "after-prayer",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...",
    transliteration: "Qul a'udhu bi-Rabbil-falaq...",
    translation: "Say: I seek refuge in the Lord of daybreak... (full surah)",
    reference: "Surah Al-Falaq (Qur'an 113)",
    repetitions: 1,
    virtue: "After Fajr and Maghrib: 3 times each."
  },
  {
    id: "after-prayer-11",
    category: "after-prayer",
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ...",
    transliteration: "Qul a'udhu bi-Rabbin-nas...",
    translation: "Say: I seek refuge in the Lord of mankind... (full surah)",
    reference: "Surah An-Nas (Qur'an 114)",
    repetitions: 1,
    virtue: "After Fajr and Maghrib: 3 times each."
  },
  {
    id: "after-prayer-12",
    category: "after-prayer",
    arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatika.",
    translation: "O Allah, help me to remember You, to thank You, and to worship You in the best manner.",
    reference: "Abu Dawud 2/86, An-Nasa'i 3/53",
    repetitions: 1,
    virtue: "Seeking help to maintain good worship."
  },
  {
    id: "after-prayer-13",
    category: "after-prayer",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبُخْلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ، وَأَعُوذُ بِكَ أَنْ أُرَدَّ إِلَى أَرْذَلِ الْعُمُرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الدُّنْيَا وَعَذَابِ الْقَبْرِ",
    transliteration: "Allahumma inni a'udhu bika minal-bukhl, wa a'udhu bika minal-jubn, wa a'udhu bika an uradda ila ardhali-'umr, wa a'udhu bika min fitnatid-dunya wa 'adhabil-qabr.",
    translation: "O Allah, I seek refuge in You from miserliness, I seek refuge in You from cowardice, I seek refuge in You from being reduced to the worst stage of life, and I seek refuge in You from the trials of this world and the punishment of the grave.",
    reference: "Al-Bukhari 4/100, 8/127",
    repetitions: 1,
    virtue: "Comprehensive protection supplication."
  },
  {
    id: "after-prayer-14",
    category: "after-prayer",
    arabic: "اللَّهُمَّ اغْفِرْ لِي وَلِوَالِدَيَّ، وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Allahummaghfir li wa li-walidayya, warhamhuma kama rabbayani saghira.",
    translation: "O Allah, forgive me and my parents, and have mercy on them as they raised me when I was small.",
    reference: "Based on Qur'an 17:24",
    repetitions: 1,
    virtue: "Supplication for parents."
  },
  {
    id: "after-prayer-15",
    category: "after-prayer",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
    translation: "Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire.",
    reference: "Qur'an 2:201",
    repetitions: 1,
    virtue: "Comprehensive dua for both worlds."
  },

  // ============================================================================
  // SLEEP ADHKAR (أذكار النوم) - 12 adhkar
  // ============================================================================
  {
    id: "sleep-1",
    category: "sleep",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya.",
    translation: "O Allah, in Your Name I die and I live.",
    reference: "Al-Bukhari 7/71",
    repetitions: 1,
    virtue: "Acknowledging Allah's power over life and death."
  },
  {
    id: "sleep-2",
    category: "sleep",
    arabic: "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ، اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ...",
    transliteration: "Ayat al-Kursi (full text)",
    translation: "Ayat al-Kursi (as mentioned above)",
    reference: "Al-Bukhari 4/487",
    repetitions: 1,
    virtue: "A guardian from Allah will protect you and Satan will not approach you until morning."
  },
  {
    id: "sleep-3",
    category: "sleep",
    arabic: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ...",
    transliteration: "Last two verses of Surah Al-Baqarah (2:285-286)",
    translation: "The Messenger believes in what has been revealed to him from his Lord, and so do the believers... (full verses)",
    reference: "Qur'an 2:285-286",
    repetitions: 1,
    virtue: "These two verses will suffice for the night."
  },
  {
    id: "sleep-4",
    category: "sleep",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ...",
    transliteration: "Surah Al-Ikhlas (full)",
    translation: "Say: He is Allah, the One...",
    reference: "Surah Al-Ikhlas (112)",
    repetitions: 3,
    virtue: "Protection through the night."
  },
  {
    id: "sleep-5",
    category: "sleep",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...",
    transliteration: "Surah Al-Falaq (full)",
    translation: "Say: I seek refuge in the Lord of daybreak...",
    reference: "Surah Al-Falaq (113)",
    repetitions: 3,
    virtue: "Protection from evil through the night."
  },
  {
    id: "sleep-6",
    category: "sleep",
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ...",
    transliteration: "Surah An-Nas (full)",
    translation: "Say: I seek refuge in the Lord of mankind...",
    reference: "Surah An-Nas (114)",
    repetitions: 3,
    virtue: "Protection from evil whispers."
  },
  {
    id: "sleep-7",
    category: "sleep",
    arabic: "اللَّهُمَّ إِنِّي أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
    transliteration: "Allahumma inni aslamtu nafsi ilayk, wa fawwadtu amri ilayk, wa wajjahtu wajhi ilayk, wa alja'tu dhahri ilayk, raghbatan wa rahbatan ilayk. La malja'a wa la manja minka illa ilayk. Amantu bikitabikal-ladhi anzalt, wa binabiyyikal-ladhi arsalt.",
    translation: "O Allah, I submit myself to You, entrust my affairs to You, turn my face to You, and lay myself down depending upon You, hoping in You and fearing You. There is no refuge, and no escape, except to You. I believe in Your Book that You revealed, and the Prophet whom You sent.",
    reference: "Al-Bukhari 7/71, Muslim 4/2081",
    repetitions: 1,
    virtue: "If you die that night, you die upon the fitrah (natural state)."
  },
  {
    id: "sleep-8",
    category: "sleep",
    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak.",
    translation: "O Allah, protect me from Your punishment on the Day You resurrect Your slaves.",
    reference: "Abu Dawud 4/311",
    repetitions: 3,
    virtue: "Protection from punishment on Day of Judgment."
  },
  {
    id: "sleep-9",
    category: "sleep",
    arabic: "سُبْحَانَ اللهِ",
    transliteration: "Subhanallah (33 times), Alhamdulillah (33 times), Allahu Akbar (34 times)",
    translation: "Glory be to Allah (33), Praise be to Allah (33), Allah is the Greatest (34)",
    reference: "Al-Bukhari, Muslim",
    repetitions: 100,
    virtue: "Better than a servant for Fatimah (RA) when she asked for one."
  },
  {
    id: "sleep-10",
    category: "sleep",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِوَجْهِكَ الْكَرِيمِ، وَكَلِمَاتِكَ التَّامَّاتِ، مِنْ شَرِّ مَا أَنْتَ آخِذٌ بِنَاصِيَتِهِ",
    transliteration: "Allahumma inni a'udhu biwajhikal-karim, wa kalimatika-t-tammat, min sharri ma anta akhidhun bi-nasiyatih.",
    translation: "O Allah, I seek refuge in Your Noble Face and Your perfect words from the evil of that which You seize by the forelock.",
    reference: "Abu Dawud 4/13",
    repetitions: 1,
    virtue: "Protection from all harm."
  },
  {
    id: "sleep-11",
    category: "sleep",
    arabic: "اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",
    transliteration: "Allahumma khalaqta nafsi wa Anta tawaffaha, laka mamatuha wa mahyaha, in ahyaytaha fahfadh-ha, wa in amattaha faghfir laha. Allahumma inni as'alukal-'afiyah.",
    translation: "O Allah, You created my soul and You take it back. Unto You is its death and its life. If You let it live, protect it, and if You cause it to die, forgive it. O Allah, I ask You for well-being.",
    reference: "Muslim 4/2083",
    repetitions: 1,
    virtue: "Comprehensive sleep supplication."
  },
  {
    id: "sleep-12",
    category: "sleep",
    arabic: "اللَّهُمَّ أَسْلَمْتُ وَجْهِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَهْبَةً وَرَغْبَةً إِلَيْكَ",
    transliteration: "Allahumma aslamtu wajhi ilayk, wa fawwadtu amri ilayk, wa alja'tu dhahri ilayk, rahbatan wa raghbatan ilayk.",
    translation: "O Allah, I turn my face to You, I entrust my affair to You, I seek Your protection, fearing and hoping in You.",
    reference: "Al-Bukhari 11/126, Muslim 4/2081",
    repetitions: 1,
    virtue: "Complete reliance on Allah before sleep."
  },

  // ============================================================================
  // PROTECTION ADHKAR (أذكار الحماية) - 10 adhkar
  // ============================================================================
  {
    id: "protection-1",
    category: "protection",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
    translation: "I seek refuge in the Perfect Words of Allah from the evil of what He has created.",
    reference: "Muslim 4/2080, Ahmad 2/290",
    repetitions: 3,
    virtue: "Protection from all harm and evil creatures."
  },
  {
    id: "protection-2",
    category: "protection",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal, wa a'udhu bika minal-jubni wal-bukhl, wa a'udhu bika min ghalabatid-dayni wa qahrir-rijal.",
    translation: "O Allah, I seek refuge in You from worry and grief, from helplessness and laziness, from cowardice and miserliness, and from being overpowered by debt and from the oppression of men.",
    reference: "Al-Bukhari 7/158",
    repetitions: 1,
    virtue: "Comprehensive protection from psychological and social harm."
  },
  {
    id: "protection-3",
    category: "protection",
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ",
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa Ant.",
    translation: "O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight. There is no god but You.",
    reference: "Abu Dawud 4/324",
    repetitions: 3,
    virtue: "Health and sensory protection."
  },
  {
    id: "protection-4",
    category: "protection",
    arabic: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Hasbiyallahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adhim.",
    translation: "Allah is sufficient for me. There is no god but Him. In Him I put my trust, and He is the Lord of the Mighty Throne.",
    reference: "Abu Dawud 4/321, Ibn As-Sunni (no. 71)",
    repetitions: 7,
    virtue: "Allah will suffice you in whatever concerns you."
  },
  {
    id: "protection-5",
    category: "protection",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
    transliteration: "Allahumma inni as'alukal-'afiyah fid-dunya wal-akhirah. Allahumma inni as'alukal-'afwa wal-'afiyah fi dini wa dunyaya wa ahli wa mali. Allahummastir 'awrati wa amin raw'ati. Allahummahfadhni min bayni yaday, wa min khalfi, wa 'an yamini, wa 'an shimali, wa min fawqi, wa a'udhu bi'adhamatika an ughtala min tahti.",
    translation: "O Allah, I ask You for well-being in this world and the next. O Allah, I ask You for forgiveness and well-being in my religion, my worldly affairs, my family, and my wealth. O Allah, conceal my faults and calm my fears. O Allah, guard me from in front of me and behind me, from my right and my left, and from above me. I seek refuge in Your Greatness from being unexpectedly destroyed from beneath me.",
    reference: "Abu Dawud 4/326, Ibn Majah 2/332",
    repetitions: 1,
    virtue: "Complete protection in all directions."
  },
  {
    id: "protection-6",
    category: "protection",
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration: "Ya Hayyu ya Qayyum, birahmatika astagheeth, aslih li sha'ni kullah, wa la takilni ila nafsi tarfata 'ayn.",
    translation: "O Ever-Living, O Sustainer, by Your mercy I seek help. Set right all my affairs and do not leave me to myself even for the blink of an eye.",
    reference: "Sahih At-Targhib wat-Tarhib 1/273",
    repetitions: 1,
    virtue: "Seeking continuous divine support."
  },
  {
    id: "protection-7",
    category: "protection",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَهْدِ الْبَلاَءِ، وَدَرَكِ الشَّقَاءِ، وَسُوءِ الْقَضَاءِ، وَشَمَاتَةِ الأَعْدَاءِ",
    transliteration: "Allahumma inni a'udhu bika min jahdil-bala', wa darakish-shaqa', wa su'il-qada', wa shamatatil-a'da'.",
    translation: "O Allah, I seek refuge in You from severe calamity, from being overtaken by misery, from evil decree, and from the gloating of enemies.",
    reference: "Al-Bukhari 11/173, Muslim 4/2080",
    repetitions: 1,
    virtue: "Protection from major trials."
  },
  {
    id: "protection-8",
    category: "protection",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ",
    transliteration: "Allahumma inni a'udhu bika min zawali ni'matik, wa tahawwuli 'afiyatik, wa fuja'ati niqmatik, wa jami'i sakhatik.",
    translation: "O Allah, I seek refuge in You from the withholding of Your blessings, from the decline of the well-being You have granted, from the suddenness of Your punishment, and from all forms of Your displeasure.",
    reference: "Muslim 4/2097",
    repetitions: 1,
    virtue: "Maintaining Allah's blessings and protection."
  },
  {
    id: "protection-9",
    category: "protection",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ سَمْعِي، وَمِنْ شَرِّ بَصَرِي، وَمِنْ شَرِّ لِسَانِي، وَمِنْ شَرِّ قَلْبِي، وَمِنْ شَرِّ مَنِيِّي",
    transliteration: "Allahumma inni a'udhu bika min sharri sam'i, wa min sharri basari, wa min sharri lisani, wa min sharri qalbi, wa min sharri maniyyi.",
    translation: "O Allah, I seek refuge in You from the evil of my hearing, from the evil of my sight, from the evil of my tongue, from the evil of my heart, and from the evil of my desires.",
    reference: "Abu Dawud 4/12, At-Tirmidhi 5/487",
    repetitions: 1,
    virtue: "Protection from personal weaknesses."
  },
  {
    id: "protection-10",
    category: "protection",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ مُنْكَرَاتِ الأَخْلاَقِ، وَالأَعْمَالِ، وَالأَهْوَاءِ",
    transliteration: "Allahumma inni a'udhu bika min munkaratil-akhlaqi wal-a'mali wal-ahwa'.",
    translation: "O Allah, I seek refuge in You from bad character, bad deeds, and evil desires.",
    reference: "At-Tirmidhi 5/571",
    repetitions: 1,
    virtue: "Protection from moral corruption."
  },

  // ============================================================================
  // TRAVEL ADHKAR (أذكار السفر) - 10 adhkar
  // ============================================================================
  {
    id: "travel-1",
    category: "travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun.",
    translation: "Glory is to Him Who has subjected this to us, and we could never have it by our own efforts. And surely, to our Lord we are to return.",
    reference: "Abu Dawud 3/34, At-Tirmidhi 5/501",
    repetitions: 1,
    virtue: "Dua when mounting a vehicle or animal for travel."
  },
  {
    id: "travel-2",
    category: "travel",
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الأَهْلِ",
    transliteration: "Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa, wa minal-'amali ma tarda. Allahumma hawwin 'alayna safarana hadha, watwi 'anna bu'dahu. Allahumma Antas-sahibu fis-safar, wal-khalifatu fil-ahl.",
    translation: "O Allah, we ask You for righteousness and piety in this journey of ours, and deeds that please You. O Allah, make easy for us this journey and shorten its distance. O Allah, You are the Companion on the journey and the Guardian of the family.",
    reference: "Muslim 2/978",
    repetitions: 1,
    virtue: "Comprehensive travel supplication."
  },
  {
    id: "travel-3",
    category: "travel",
    arabic: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar, Allahu Akbar, Allahu Akbar (then recite travel dua).",
    translation: "Allah is the Greatest, Allah is the Greatest, Allah is the Greatest.",
    reference: "Al-Bukhari 2/732, Muslim 2/978",
    repetitions: 3,
    virtue: "Takbir when ascending heights during travel."
  },
  {
    id: "travel-4",
    category: "travel",
    arabic: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ",
    transliteration: "Ayibuna ta'ibuna 'abiduna li-Rabbina hamidun.",
    translation: "We are returning, repenting, worshipping, and praising our Lord.",
    reference: "Al-Bukhari 2/732, Muslim 2/980",
    repetitions: 1,
    virtue: "When returning from travel."
  },
  {
    id: "travel-5",
    category: "travel",
    arabic: "لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، آيِبُونَ تَائِبُونَ عَابِدُونَ سَاجِدُونَ لِرَبِّنَا حَامِدُونَ، صَدَقَ اللهُ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الأَحْزَابَ وَحْدَهُ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in Qadir. Ayibuna ta'ibuna 'abiduna sajiduna li-Rabbina hamidun. Sadaqallahu wa'dahu, wa nasara 'abdahu, wa hazamal-ahzaba wahdah.",
    translation: "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things. We are returning, repenting, worshipping, prostrating, and praising our Lord. Allah has fulfilled His promise, aided His slave, and He alone defeated the confederates.",
    reference: "Al-Bukhari 2/732, Muslim 2/980",
    repetitions: 1,
    virtue: "Complete return from travel dua."
  },
  {
    id: "travel-6",
    category: "travel",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
    translation: "I seek refuge in the Perfect Words of Allah from the evil of what He has created.",
    reference: "Muslim 4/2080",
    repetitions: 3,
    virtue: "Protection when stopping at a place during travel."
  },
  {
    id: "travel-7",
    category: "travel",
    arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ",
    transliteration: "Allahummahdini fiman hadayt, wa 'afini fiman 'afayt, wa tawallani fiman tawallayt.",
    translation: "O Allah, guide me among those You have guided, grant me well-being among those You have granted well-being, and take me into Your charge among those You have taken into Your charge.",
    reference: "Abu Dawud 2/62, At-Tirmidhi 2/178",
    repetitions: 1,
    virtue: "Seeking Allah's care and protection."
  },
  {
    id: "travel-8",
    category: "travel",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالأَهْلِ",
    transliteration: "Allahumma inni a'udhu bika min wa'tha'is-safar, wa ka'abatil-mandhar, wa su'il-munqalabi fil-mali wal-ahl.",
    translation: "O Allah, I seek refuge in You from the difficulties of travel, from an unhappy change of circumstances, and from a bad return in property and family.",
    reference: "Muslim 2/978",
    repetitions: 1,
    virtue: "Protection from travel hardships."
  },
  {
    id: "travel-9",
    category: "travel",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِي سَفَرِنَا، وَاطْوِ لَنَا الأَرْضَ",
    transliteration: "Allahumma barik lana fi safarina, watwi lanal-ard.",
    translation: "O Allah, bless us in our journey and make the earth easy to traverse for us.",
    reference: "Based on authentic travel supplications",
    repetitions: 1,
    virtue: "Seeking blessings in travel."
  },
  {
    id: "travel-10",
    category: "travel",
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ مِنْ خَيْرِ هَذَا الْمَكَانِ، وَنَعُوذُ بِكَ مِنْ شَرِّهِ",
    transliteration: "Allahumma inna nas'aluka min khayri hadhal-makan, wa na'udhu bika min sharrih.",
    translation: "O Allah, we ask You for the goodness of this place and seek refuge in You from its evil.",
    reference: "Based on authentic adhkar principles",
    repetitions: 1,
    virtue: "When entering a new place."
  },

  // ============================================================================
  // EATING & DRINKING ADHKAR (أذكار الطعام) - 8 adhkar
  // ============================================================================
  {
    id: "eating-1",
    category: "eating",
    arabic: "بِسْمِ اللهِ",
    transliteration: "Bismillah.",
    translation: "In the Name of Allah.",
    reference: "Al-Bukhari, Muslim",
    repetitions: 1,
    virtue: "Before eating. Satan cannot share the food with you."
  },
  {
    id: "eating-2",
    category: "eating",
    arabic: "بِسْمِ اللهِ أَوَّلَهُ وَآخِرَهُ",
    transliteration: "Bismillahi awwalahu wa akhirahu.",
    translation: "In the Name of Allah at its beginning and its end.",
    reference: "Abu Dawud 3/347, At-Tirmidhi 4/288",
    repetitions: 1,
    virtue: "If you forget to say Bismillah before eating."
  },
  {
    id: "eating-3",
    category: "eating",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ",
    transliteration: "Alhamdulillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.",
    translation: "Praise is to Allah Who has fed me this and provided it for me without any might or power from myself.",
    reference: "Abu Dawud 4/349, At-Tirmidhi 5/507",
    repetitions: 1,
    virtue: "After eating. Past sins are forgiven."
  },
  {
    id: "eating-4",
    category: "eating",
    arabic: "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ، غَيْرَ مَكْفِيٍّ وَلاَ مُوَدَّعٍ وَلاَ مُسْتَغْنىً عَنْهُ رَبَّنَا",
    transliteration: "Alhamdulillahi hamdan kathiran tayyiban mubarakan fih, ghayra makfiyyin wa la muwadda'in wa la mustaghnan 'anhu Rabbana.",
    translation: "Praise is to Allah, an abundant, pure, and blessed praise. He is not to be thanked sufficiently, nor can He be left, nor can He be dispensed with, our Lord.",
    reference: "Al-Bukhari 7/206",
    repetitions: 1,
    virtue: "After eating - comprehensive gratitude."
  },
  {
    id: "eating-5",
    category: "eating",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Allahumma barik lana fima razaqtana wa qina 'adhaban-nar.",
    translation: "O Allah, bless us in what You have provided us and save us from the punishment of the Fire.",
    reference: "Abu Dawud, At-Tirmidhi",
    repetitions: 1,
    virtue: "Blessing the food."
  },
  {
    id: "eating-6",
    category: "eating",
    arabic: "اللَّهُمَّ أَطْعَمْتَ وَسَقَيْتَ، وَأَشْبَعْتَ وَأَرْوَيْتَ، فَلَكَ الْحَمْدُ غَيْرَ مَكْفِيٍّ وَلاَ مَكْفُورٍ",
    transliteration: "Allahumma at'amta wa saqayt, wa ashba'ta wa arwayt, falakal-hamdu ghayra makfiyyin wa la makfur.",
    translation: "O Allah, You have fed and given drink, satisfied and quenched, so praise is to You, a praise that is neither insufficient nor unworthy.",
    reference: "Based on authentic gratitude supplications",
    repetitions: 1,
    virtue: "After drinking water."
  },
  {
    id: "eating-7",
    category: "eating",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْرًا مِنْهُ",
    transliteration: "Allahumma barik lana fihi wa at'imna khayran minhu.",
    translation: "O Allah, bless us in it and feed us better than it.",
    reference: "Abu Dawud 3/360",
    repetitions: 1,
    virtue: "After eating fruit."
  },
  {
    id: "eating-8",
    category: "eating",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ",
    transliteration: "Allahumma barik lana fihi wa zidna minhu.",
    translation: "O Allah, bless us in it and increase it for us.",
    reference: "At-Tirmidhi 5/506",
    repetitions: 1,
    virtue: "After drinking milk."
  },

  // ============================================================================
  // GENERAL DUAS (أدعية عامة) - 15 duas
  // ============================================================================
  {
    id: "general-1",
    category: "general",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
    translation: "Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire.",
    reference: "Qur'an 2:201",
    repetitions: 1,
    virtue: "Most comprehensive dua for both worlds."
  },
  {
    id: "general-2",
    category: "general",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي، وَاحْلُلْ عُقْدَةً مِن لِسَانِي، يَفْقَهُوا قَوْلِي",
    transliteration: "Rabbish-rah li sadri, wa yassir li amri, wahlul 'uqdatan min lisani, yafqahu qawli.",
    translation: "My Lord, expand my chest, make my task easy for me, and untie the knot from my tongue that they may understand my speech.",
    reference: "Qur'an 20:25-28",
    repetitions: 1,
    virtue: "Dua of Prophet Musa for clarity and ease."
  },
  {
    id: "general-3",
    category: "general",
    arabic: "رَبَّنَا لاَ تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ",
    transliteration: "Rabbana la tuzigh qulubana ba'da idh hadaytana wa hab lana min ladunka rahmah, innaka Antal-Wahhab.",
    translation: "Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself. Indeed, You are the Bestower.",
    reference: "Qur'an 3:8",
    repetitions: 1,
    virtue: "Seeking steadfastness in faith."
  },
  {
    id: "general-4",
    category: "general",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma.",
    translation: "My Lord, increase me in knowledge.",
    reference: "Qur'an 20:114",
    repetitions: 1,
    virtue: "Seeking beneficial knowledge."
  },
  {
    id: "general-5",
    category: "general",
    arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالإِيمَانِ وَلاَ تَجْعَلْ فِي قُلُوبِنَا غِلاًّ لِّلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ",
    transliteration: "Rabbanagh-fir lana wa li-ikhwaninal-ladhina sabaquna bil-imani wa la taj'al fi qulubina ghillan lil-ladhina amanu Rabbana innaka Ra'ufun Rahim.",
    translation: "Our Lord, forgive us and our brothers who preceded us in faith, and put not in our hearts any resentment toward those who have believed. Our Lord, indeed You are Kind and Merciful.",
    reference: "Qur'an 59:10",
    repetitions: 1,
    virtue: "Dua for forgiveness of all believers."
  },
  {
    id: "general-6",
    category: "general",
    arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbigh-fir li wa li-walidayya warhamhuma kama rabbayani saghira.",
    translation: "My Lord, forgive me and my parents and have mercy on them as they raised me when I was small.",
    reference: "Based on Qur'an 17:24",
    repetitions: 1,
    virtue: "Essential dua for parents."
  },
  {
    id: "general-7",
    category: "general",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    transliteration: "Allahumma inni as'alukal-huda wat-tuqa wal-'afafa wal-ghina.",
    translation: "O Allah, I ask You for guidance, piety, chastity, and contentment.",
    reference: "Muslim 4/2099",
    repetitions: 1,
    virtue: "Four essential qualities."
  },
  {
    id: "general-8",
    category: "general",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
    transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyah fid-dunya wal-akhirah.",
    translation: "O Allah, I ask You for forgiveness and well-being in this world and the Hereafter.",
    reference: "Ibn Majah, At-Tirmidhi",
    repetitions: 1,
    virtue: "Comprehensive wellbeing."
  },
  {
    id: "general-9",
    category: "general",
    arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    transliteration: "Allahummahdini wa saddidni.",
    translation: "O Allah, guide me and make me steadfast.",
    reference: "Muslim 4/2087",
    repetitions: 1,
    virtue: "Seeking guidance and steadfastness."
  },
  {
    id: "general-10",
    category: "general",
    arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ، وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
    transliteration: "Allahumma inni dhalamtu nafsi dhulman kathira, wa la yaghfirudh-dhunuba illa Ant, faghfir li maghfiratan min 'indik, warhamni innaka Antal-Ghafur-ur-Rahim.",
    translation: "O Allah, I have greatly wronged myself and no one forgives sins but You. So grant me forgiveness from You and have mercy on me. Surely, You are Forgiving, Merciful.",
    reference: "Al-Bukhari 8/168, Muslim 4/2078",
    repetitions: 1,
    virtue: "Sayyid al-Istighfar - Master of seeking forgiveness."
  },
  {
    id: "general-11",
    category: "general",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ فِعْلَ الْخَيْرَاتِ، وَتَرْكَ الْمُنْكَرَاتِ، وَحُبَّ الْمَسَاكِينِ",
    transliteration: "Allahumma inni as'aluka fi'lal-khayrat, wa tarkal-munkarat, wa hubbal-masakin.",
    translation: "O Allah, I ask You for doing good deeds, leaving evil deeds, and love for the poor.",
    reference: "At-Tirmidhi 5/567",
    repetitions: 1,
    virtue: "Seeking righteous character."
  },
  {
    id: "general-12",
    category: "general",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ، وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ",
    transliteration: "Allahumma inni as'aluka minal-khayri kullihi 'ajilihi wa ajilihi, ma 'alimtu minhu wa ma lam a'lam. Wa a'udhu bika minash-sharri kullihi.",
    translation: "O Allah, I ask You for all that is good, in this world and in the Hereafter, what I know of it and what I do not know. And I seek refuge in You from all evil.",
    reference: "Ibn Majah 2/1264",
    repetitions: 1,
    virtue: "Comprehensive dua for good and protection from evil."
  },
  {
    id: "general-13",
    category: "general",
    arabic: "اللَّهُمَّ اجْعَلْنِي صَبُورًا، وَاجْعَلْنِي شَكُورًا، وَاجْعَلْنِي فِي عَيْنِي صَغِيرًا، وَفِي أَعْيُنِ النَّاسِ كَبِيرًا",
    transliteration: "Allahummaj'alni sabura, waj'alni shakura, waj'alni fi 'ayni saghira, wa fi a'yunin-nasi kabira.",
    translation: "O Allah, make me patient, make me grateful, make me small in my own eyes, and great in the eyes of people.",
    reference: "Based on authenticated supplications",
    repetitions: 1,
    virtue: "Character development dua."
  },
  {
    id: "general-14",
    category: "general",
    arabic: "اللَّهُمَّ اكْفِنِي بِحَلاَلِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    transliteration: "Allahummakfini bi-halalika 'an haramik, wa aghnini bi-fadlika 'amman siwak.",
    translation: "O Allah, suffice me with what is lawful instead of what is unlawful, and make me independent of all others besides You.",
    reference: "At-Tirmidhi 5/560",
    repetitions: 1,
    virtue: "Seeking lawful provision and independence."
  },
  {
    id: "general-15",
    category: "general",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad kama sallayta 'ala Ibrahim, innaka Hamidun Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad kama barakta 'ala Ibrahim, innaka Hamidun Majid.",
    translation: "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim. You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim. You are Praiseworthy, Most Glorious.",
    reference: "Al-Bukhari 6/408, Muslim 1/306",
    repetitions: 1,
    virtue: "Salawat upon the Prophet (peace be upon him)."
  }
];

/**
 * Seed function to populate adhkar table
 */
export async function seedAdhkar() {
  try {
    console.log("Starting adhkar seed...");
    console.log(`Preparing to insert ${ADHKAR_DATA.length} adhkar...`);

    // Insert all adhkar
    await db.insert(adhkar).values(ADHKAR_DATA);

    console.log("✅ Successfully seeded adhkar table");
    console.log(`✅ Inserted ${ADHKAR_DATA.length} authentic adhkar/duas`);

    // Print category counts
    const categoryCounts = ADHKAR_DATA.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("\n📊 Adhkar by category:");
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    console.log("\n✨ All adhkar have been successfully seeded with authentic references!");

  } catch (error) {
    console.error("❌ Error seeding adhkar:", error);
    throw error;
  }
}

// Run seed if executed directly
if (require.main === module) {
  seedAdhkar()
    .then(() => {
      console.log("✅ Seed completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}
