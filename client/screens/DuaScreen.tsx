import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";

interface InnerState {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

interface LifeContext {
  id: string;
  label: string;
}

interface Dua {
  arabic: string;
  transliteration: string;
  english: string;
  forState: string;
}

const INNER_STATES: InnerState[] = [
  { id: "anxiety", label: "Anxiety & worry", icon: "cloud" },
  { id: "provision", label: "Provision pressure", icon: "dollar-sign" },
  { id: "grief", label: "Grief & sadness", icon: "droplet" },
  { id: "sin", label: "Guilt after sin", icon: "refresh-cw" },
  { id: "anger", label: "Anger & frustration", icon: "zap" },
  { id: "unseen", label: "Feeling unseen", icon: "eye-off" },
];

const LIFE_CONTEXTS: LifeContext[] = [
  { id: "work", label: "Work & provision" },
  { id: "family", label: "Family & marriage" },
  { id: "health", label: "Health & worry" },
  { id: "return", label: "Sin & return" },
  { id: "fear", label: "Anxiety & fear" },
  { id: "gratitude", label: "Gratitude & steadiness" },
];

const DUAS: Record<string, Record<string, Dua>> = {
  anxiety: {
    work: {
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
      transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
      english: "O Allah, I seek refuge in You from worry and grief",
      forState: "When work weighs heavy on your heart",
    },
    family: {
      arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
      transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun",
      english: "Our Lord, grant us from our spouses and offspring comfort to our eyes",
      forState: "When family matters create unease",
    },
    health: {
      arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي",
      transliteration: "Allahumma Rabban-nas, adhhibil-ba's, ishfi antash-Shafi",
      english: "O Allah, Lord of mankind, remove the hardship and heal, You are the Healer",
      forState: "When health concerns create worry",
    },
    return: {
      arabic: "رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي",
      transliteration: "Rabbi inni dhalamtu nafsi faghfir li",
      english: "My Lord, I have wronged myself, so forgive me",
      forState: "When past mistakes create present anxiety",
    },
    fear: {
      arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      transliteration: "Hasbunallahu wa ni'mal-wakeel",
      english: "Allah is sufficient for us, and He is the best disposer of affairs",
      forState: "When fear clouds your vision",
    },
    gratitude: {
      arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
      english: "O Allah, help me remember You, thank You, and worship You well",
      forState: "When you want to anchor in gratitude",
    },
  },
  provision: {
    work: {
      arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
      transliteration: "Allahumma-kfini bihalalika 'an haramik, wa aghnini bifadlika 'amman siwak",
      english: "O Allah, suffice me with what is lawful over what is forbidden, and enrich me by Your favor over all others",
      forState: "When provision feels tight",
    },
    family: {
      arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
      transliteration: "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya",
      english: "My Lord, enable me to be grateful for Your favor upon me",
      forState: "When you need to see the blessing in what you have",
    },
    health: {
      arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي",
      transliteration: "Allahumma 'afini fi badani",
      english: "O Allah, grant me health in my body",
      forState: "When health is the truest wealth",
    },
    return: {
      arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا",
      transliteration: "Rabbana la tu'akhidhna in nasina aw akhta'na",
      english: "Our Lord, do not take us to account if we forget or make mistakes",
      forState: "When you've erred in pursuit of provision",
    },
    fear: {
      arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
      transliteration: "Wa man yatawakkal 'alallahi fahuwa hasbuh",
      english: "And whoever relies upon Allah, He is sufficient for them",
      forState: "When fear of scarcity grips you",
    },
    gratitude: {
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
      transliteration: "Alhamdulillahil-ladhi at'amana wa saqana wa ja'alana muslimeen",
      english: "Praise be to Allah who fed us, gave us drink, and made us Muslims",
      forState: "When you want to ground in what you already have",
    },
  },
  grief: {
    work: {
      arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
      transliteration: "Inna lillahi wa inna ilayhi raji'un",
      english: "Indeed, we belong to Allah, and to Him we return",
      forState: "When loss touches your work life",
    },
    family: {
      arabic: "اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
      transliteration: "Allahumma'jurni fi musibati wa akhlif li khayran minha",
      english: "O Allah, reward me in my affliction and replace it with something better",
      forState: "When grief touches your family",
    },
    health: {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",
      transliteration: "Allahumma inni as'alukal-'afiyah",
      english: "O Allah, I ask You for wellbeing",
      forState: "When grief and health concerns intertwine",
    },
    return: {
      arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ",
      transliteration: "Rabbighfir warham wa anta khayrur-rahimeen",
      english: "My Lord, forgive and have mercy, and You are the best of the merciful",
      forState: "When grief mingles with regret",
    },
    fear: {
      arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
      transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimeen",
      english: "There is no god but You, glory be to You, indeed I was among the wrongdoers",
      forState: "When grief brings fear of what's next",
    },
    gratitude: {
      arabic: "الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ",
      transliteration: "Alhamdulillahi 'ala kulli hal",
      english: "Praise be to Allah in every condition",
      forState: "When you seek to hold grief and gratitude together",
    },
  },
  sin: {
    work: {
      arabic: "رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي",
      transliteration: "Rabbi inni dhalamtu nafsi faghfir li",
      english: "My Lord, I have wronged myself, so forgive me",
      forState: "When work led you astray",
    },
    family: {
      arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ",
      transliteration: "Rabbana-ghfir lana wa li-ikhwaninal-ladhina sabaquna bil-iman",
      english: "Our Lord, forgive us and our brothers who preceded us in faith",
      forState: "When you've wronged family",
    },
    health: {
      arabic: "اللَّهُمَّ إِنِّي أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
      transliteration: "Allahumma inni astaghfiruka wa atubu ilayk",
      english: "O Allah, I seek Your forgiveness and turn to You in repentance",
      forState: "When sin has affected your wellbeing",
    },
    return: {
      arabic: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
      transliteration: "Astaghfirullaha-lladhi la ilaha illa huwal-Hayyul-Qayyum wa atubu ilayh",
      english: "I seek forgiveness from Allah, there is no god but He, the Living, the Sustainer, and I turn to Him in repentance",
      forState: "When you're ready to return",
    },
    fear: {
      arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا",
      transliteration: "Rabbana la tuzigh qulubana ba'da idh hadaytana",
      english: "Our Lord, do not let our hearts deviate after You have guided us",
      forState: "When you fear falling again",
    },
    gratitude: {
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَذَا",
      transliteration: "Alhamdulillahil-ladhi hadana lihadha",
      english: "Praise be to Allah who guided us to this",
      forState: "When you're grateful for the chance to return",
    },
  },
  anger: {
    work: {
      arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
      transliteration: "A'udhu billahi minash-shaytanir-rajeem",
      english: "I seek refuge in Allah from the accursed Satan",
      forState: "When work frustration builds",
    },
    family: {
      arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ",
      transliteration: "Rabbi awzi'ni an ashkura ni'matak",
      english: "My Lord, enable me to be grateful for Your blessing",
      forState: "When family tests your patience",
    },
    health: {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
      transliteration: "Allahumma inni as'alukal-huda wat-tuqa wal-'afafa wal-ghina",
      english: "O Allah, I ask You for guidance, piety, chastity, and contentment",
      forState: "When anger affects your peace",
    },
    return: {
      arabic: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا",
      transliteration: "Rabbana-ghfir lana dhunubana wa israfana fi amrina",
      english: "Our Lord, forgive us our sins and our excess in our affairs",
      forState: "When anger led you to wrong",
    },
    fear: {
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي",
      transliteration: "Allahumma inni a'udhu bika min sharri nafsi",
      english: "O Allah, I seek refuge in You from the evil of my own self",
      forState: "When you fear your own reaction",
    },
    gratitude: {
      arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا",
      transliteration: "Raditu billahi rabban wa bil-islami dinan",
      english: "I am pleased with Allah as Lord and Islam as religion",
      forState: "When you want to release and accept",
    },
  },
  unseen: {
    work: {
      arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ",
      transliteration: "Hasbiyal-lahu la ilaha illa huwa 'alayhi tawakkaltu",
      english: "Allah is sufficient for me, there is no god but He, in Him I place my trust",
      forState: "When your work goes unrecognized",
    },
    family: {
      arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنْتَ خَيْرُ الْوَارِثِينَ",
      transliteration: "Rabbi la tadharnī fardan wa anta khayrul-waritheen",
      english: "My Lord, do not leave me alone, and You are the best of inheritors",
      forState: "When you feel invisible to family",
    },
    health: {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
      transliteration: "Allahumma inni as'alukal-'afiyata fid-dunya wal-akhirah",
      english: "O Allah, I ask You for wellbeing in this world and the next",
      forState: "When suffering feels unwitnessed",
    },
    return: {
      arabic: "إِنَّ اللَّهَ يَعْلَمُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ",
      transliteration: "Innallaha ya'lamu ma fis-samawati wal-ard",
      english: "Indeed, Allah knows what is in the heavens and the earth",
      forState: "When you need to know you are seen",
    },
    fear: {
      arabic: "وَاللَّهُ بَصِيرٌ بِالْعِبَادِ",
      transliteration: "Wallahu baseerun bil-'ibad",
      english: "And Allah is All-Seeing of His servants",
      forState: "When you fear being forgotten",
    },
    gratitude: {
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي لَا يَخْفَى عَلَيْهِ شَيْءٌ",
      transliteration: "Alhamdulillahil-ladhi la yakhfa 'alayhi shay'",
      english: "Praise be to Allah from whom nothing is hidden",
      forState: "When you ground in being truly known",
    },
  },
};

export default function DuaScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [selectedState, setSelectedState] = useState<InnerState | null>(null);
  const [selectedContext, setSelectedContext] = useState<LifeContext | null>(null);

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;
  const isDemo = true; // Demo mode

  const selectedDua = selectedState && selectedContext 
    ? DUAS[selectedState.id]?.[selectedContext.id] 
    : null;

  const handleBack = () => {
    if (selectedDua) {
      setSelectedContext(null);
    } else if (selectedContext) {
      setSelectedContext(null);
    } else if (selectedState) {
      setSelectedState(null);
    } else {
      navigation.goBack();
    }
  };

  if (selectedDua) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
            Back
          </ThemedText>
        </Pressable>

        <Animated.View entering={FadeInUp.duration(500)}>
          <View style={[styles.duaCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h2" style={styles.arabicText}>
              {selectedDua.arabic}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.translitContainer}>
          <ThemedText type="body" style={[styles.transliteration, { color: theme.textSecondary }]}>
            {selectedDua.transliteration}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.englishContainer}>
          <ThemedText type="bodyLarge" style={{ fontFamily: Fonts?.serif, lineHeight: 28 }}>
            {selectedDua.english}
          </ThemedText>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(400).delay(300)}
          style={[styles.forStateCard, { backgroundColor: SiraatColors.indigo + "10" }]}
        >
          <View style={[styles.forStateAccent, { backgroundColor: SiraatColors.indigo }]} />
          <ThemedText type="small" style={{ color: theme.textSecondary, fontStyle: "italic" }}>
            {selectedDua.forState}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.doneContainer}>
          <Button
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: theme.primary }}
          >
            Done
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  if (selectedState) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
            Back
          </ThemedText>
        </Pressable>

        <Animated.View entering={FadeInDown.duration(400)} style={styles.intro}>
          <ThemedText type="h3" style={{ fontFamily: Fonts?.serif, marginBottom: Spacing.sm }}>
            What area of life?
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Choose the context that fits your situation.
          </ThemedText>
        </Animated.View>

        <View style={styles.optionsList}>
          {LIFE_CONTEXTS.map((context, index) => (
            <Animated.View
              key={context.id}
              entering={FadeInUp.duration(400).delay(100 + index * 60)}
            >
              <Pressable
                onPress={() => setSelectedContext(context)}
                style={({ pressed }) => [
                  styles.optionCard,
                  { 
                    backgroundColor: theme.cardBackground,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <ThemedText type="body">{context.label}</ThemedText>
                <Feather name="chevron-right" size={18} color={theme.textSecondary} />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + Spacing["3xl"] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)} style={styles.intro}>
        <ThemedText type="h3" style={{ fontFamily: Fonts?.serif, marginBottom: Spacing.sm }}>
          What are you carrying?
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Choose what fits closest to how you feel.
        </ThemedText>
      </Animated.View>

      <View style={styles.optionsList}>
        {INNER_STATES.map((state, index) => {
          const isLocked = !isPaid && !isDemo && index > 2;
          return (
            <Animated.View
              key={state.id}
              entering={FadeInUp.duration(400).delay(100 + index * 60)}
            >
              <Pressable
                onPress={() => !isLocked && setSelectedState(state)}
                style={({ pressed }) => [
                  styles.stateCard,
                  { 
                    backgroundColor: theme.cardBackground,
                    opacity: pressed && !isLocked ? 0.85 : isLocked ? 0.5 : 1,
                  },
                ]}
              >
                <View style={[styles.stateIcon, { backgroundColor: SiraatColors.indigo + "15" }]}>
                  <Feather name={state.icon} size={20} color={SiraatColors.indigo} />
                </View>
                <ThemedText type="body" style={{ flex: 1 }}>{state.label}</ThemedText>
                {isLocked ? (
                  <Feather name="lock" size={16} color={theme.textSecondary} />
                ) : (
                  <Feather name="chevron-right" size={18} color={theme.textSecondary} />
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  intro: {
    marginBottom: Spacing["2xl"],
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  optionsList: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  stateCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.lg,
  },
  stateIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  duaCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  arabicText: {
    fontSize: 28,
    lineHeight: 48,
    textAlign: "center",
    fontFamily: "serif",
  },
  translitContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  transliteration: {
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
  },
  englishContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  forStateCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginTop: Spacing["2xl"],
  },
  forStateAccent: {
    width: 4,
  },
  doneContainer: {
    marginTop: Spacing["2xl"],
  },
});
