import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { Layout } from "@/constants/layout";
import { Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TTSButton } from "@/components/TTSButton";
import { withScreenErrorBoundary } from "@/components/ScreenErrorBoundary";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
      arabic:
        "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
      transliteration:
        "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun",
      english:
        "Our Lord, grant us from our spouses and offspring comfort to our eyes",
      forState: "When family matters create unease",
    },
    health: {
      arabic:
        "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي",
      transliteration:
        "Allahumma Rabban-nas, adhhibil-ba's, ishfi antash-Shafi",
      english:
        "O Allah, Lord of mankind, remove the hardship and heal, You are the Healer",
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
      english:
        "Allah is sufficient for us, and He is the best disposer of affairs",
      forState: "When fear clouds your vision",
    },
    gratitude: {
      arabic:
        "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      transliteration:
        "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
      english: "O Allah, help me remember You, thank You, and worship You well",
      forState: "When you want to anchor in gratitude",
    },
  },
  provision: {
    work: {
      arabic:
        "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
      transliteration:
        "Allahumma-kfini bihalalika 'an haramik, wa aghnini bifadlika 'amman siwak",
      english:
        "O Allah, suffice me with what is lawful over what is forbidden, and enrich me by Your favor over all others",
      forState: "When provision feels tight",
    },
    family: {
      arabic:
        "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
      transliteration:
        "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya",
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
      english:
        "Our Lord, do not take us to account if we forget or make mistakes",
      forState: "When you've erred in pursuit of provision",
    },
    fear: {
      arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
      transliteration: "Wa man yatawakkal 'alallahi fahuwa hasbuh",
      english: "And whoever relies upon Allah, He is sufficient for them",
      forState: "When fear of scarcity grips you",
    },
    gratitude: {
      arabic:
        "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
      transliteration:
        "Alhamdulillahil-ladhi at'amana wa saqana wa ja'alana muslimeen",
      english:
        "Praise be to Allah who fed us, gave us drink, and made us Muslims",
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
      arabic:
        "اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
      transliteration: "Allahumma'jurni fi musibati wa akhlif li khayran minha",
      english:
        "O Allah, reward me in my affliction and replace it with something better",
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
      english:
        "My Lord, forgive and have mercy, and You are the best of the merciful",
      forState: "When grief mingles with regret",
    },
    fear: {
      arabic:
        "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
      transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimeen",
      english:
        "There is no god but You, glory be to You, indeed I was among the wrongdoers",
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
      arabic:
        "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ",
      transliteration:
        "Rabbana-ghfir lana wa li-ikhwaninal-ladhina sabaquna bil-iman",
      english: "Our Lord, forgive us and our brothers who preceded us in faith",
      forState: "When sin affects those you love",
    },
    health: {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ",
      transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyah",
      english: "O Allah, I ask You for pardon and wellbeing",
      forState: "When sin weighs on your body and soul",
    },
    return: {
      arabic:
        "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
      transliteration:
        "Rabbana dhalamna anfusana wa in lam taghfir lana wa tarhamna lanakoonanna minal-khasireen",
      english:
        "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers",
      forState: "When you need to return fully",
    },
    fear: {
      arabic:
        "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ",
      transliteration:
        "Rabbighfir li wa tub 'alayya innaka antat-Tawwabur-Raheem",
      english:
        "My Lord, forgive me and accept my repentance, You are the Accepting of repentance, the Merciful",
      forState: "When fear of consequences grips you",
    },
    gratitude: {
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا",
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
      forState: "When workplace frustrations boil over",
    },
    family: {
      arabic:
        "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
      transliteration:
        "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun",
      english:
        "Our Lord, grant us from our spouses and offspring comfort to our eyes",
      forState: "When family conflicts stir anger",
    },
    health: {
      arabic: "اللَّهُمَّ أَصْلِحْ لِي قَلْبِي",
      transliteration: "Allahumma aslih li qalbi",
      english: "O Allah, rectify my heart",
      forState: "When anger affects your wellbeing",
    },
    return: {
      arabic: "رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي",
      transliteration: "Rabbi inni dhalamtu nafsi faghfir li",
      english: "My Lord, I have wronged myself, so forgive me",
      forState: "When anger led to regret",
    },
    fear: {
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي",
      transliteration: "Allahumma inni a'udhu bika min sharri nafsi",
      english: "O Allah, I seek refuge in You from the evil of my own self",
      forState: "When you fear what anger might cause",
    },
    gratitude: {
      arabic: "الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ",
      transliteration: "Alhamdulillahi 'ala kulli hal",
      english: "Praise be to Allah in every condition",
      forState: "When you want to replace anger with gratitude",
    },
  },
  unseen: {
    work: {
      arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ",
      transliteration: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu",
      english:
        "Allah is sufficient for me, there is no god but Him, in Him I place my trust",
      forState: "When your work goes unrecognized",
    },
    family: {
      arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
      transliteration: "Rabbi la tadharniy fardan wa anta khayrul-waritheen",
      english:
        "My Lord, do not leave me alone, and You are the best of inheritors",
      forState: "When you feel unseen by those closest to you",
    },
    health: {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",
      transliteration: "Allahumma inni as'alukal-'afiyah",
      english: "O Allah, I ask You for wellbeing",
      forState: "When feeling unseen affects your health",
    },
    return: {
      arabic: "إِنَّ اللَّهَ يَعْلَمُ مَا تُخْفُونَ وَمَا تُعْلِنُونَ",
      transliteration: "Innallaha ya'lamu ma tukhfoona wa ma tu'linoon",
      english: "Indeed, Allah knows what you conceal and what you reveal",
      forState: "When you need to remember you are always seen",
    },
    fear: {
      arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
      transliteration: "Wa huwa ma'akum ayna ma kuntum",
      english: "And He is with you wherever you are",
      forState: "When invisibility brings fear",
    },
    gratitude: {
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي يَرَانِي وَلَا أَرَاهُ",
      transliteration: "Alhamdulillahil-ladhi yarani wa la arah",
      english: "Praise be to Allah who sees me though I do not see Him",
      forState: "When you want to rest in being seen by Allah",
    },
  },
};

const { spacing, radii, container, typeScale } = Layout;

function DuaScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [selectedState, setSelectedState] = useState<InnerState | null>(null);
  const [selectedContext, setSelectedContext] = useState<LifeContext | null>(
    null,
  );

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;
  const isDemo = true;

  const handleBack = () => {
    if (selectedContext) {
      setSelectedContext(null);
    } else if (selectedState) {
      setSelectedState(null);
    } else {
      navigation.goBack();
    }
  };

  const selectedDua =
    selectedState && selectedContext
      ? DUAS[selectedState.id]?.[selectedContext.id]
      : null;

  if (selectedDua) {
    return (
      <Screen title="Dua" showBack onBack={handleBack}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <View
            style={[
              styles.duaCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText style={styles.arabicText}>
              {selectedDua.arabic}
            </ThemedText>
            <TTSButton text={selectedDua.arabic} size={22} style={styles.ttsButton} />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(350).delay(100)}
          style={styles.translitContainer}
        >
          <ThemedText
            style={[styles.transliteration, { color: theme.textSecondary }]}
          >
            {selectedDua.transliteration}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(350).delay(150)}
          style={styles.englishContainer}
        >
          <ThemedText
            style={[styles.englishText, { fontFamily: Fonts?.serif }]}
          >
            {selectedDua.english}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(350).delay(200)}
          style={[
            styles.forStateCard,
            { backgroundColor: theme.pillBackground + "10" },
          ]}
        >
          <View
            style={[
              styles.forStateAccent,
              { backgroundColor: theme.pillBackground },
            ]}
          />
          <ThemedText
            style={[styles.forStateText, { color: theme.textSecondary }]}
          >
            {selectedDua.forState}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(350).delay(250)}
          style={styles.doneContainer}
        >
          <Button
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: theme.primary }}
            accessibilityHint="Returns to previous screen"
          >
            Done
          </Button>
        </Animated.View>
      </Screen>
    );
  }

  if (selectedState) {
    return (
      <Screen title="Dua" showBack onBack={handleBack}>
        <Animated.View entering={FadeInDown.duration(350)} style={styles.intro}>
          <ThemedText style={[styles.introTitle, { fontFamily: Fonts?.serif }]}>
            What area of life?
          </ThemedText>
          <ThemedText
            style={[styles.introSubtitle, { color: theme.textSecondary }]}
          >
            Choose the context that fits.
          </ThemedText>
        </Animated.View>

        <View style={styles.optionsList}>
          {LIFE_CONTEXTS.map((context, index) => (
            <Animated.View
              key={context.id}
              entering={FadeInUp.duration(350).delay(80 + index * 50)}
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
                accessibilityRole="button"
                accessibilityLabel={context.label}
                accessibilityHint="Shows a dua for this life context"
              >
                <ThemedText style={styles.optionText}>
                  {context.label}
                </ThemedText>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={theme.textSecondary}
                />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Dua" showBack>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.intro}>
        <ThemedText style={[styles.introTitle, { fontFamily: Fonts?.serif }]}>
          What are you carrying?
        </ThemedText>
        <ThemedText
          style={[styles.introSubtitle, { color: theme.textSecondary }]}
        >
          Choose what fits closest.
        </ThemedText>
      </Animated.View>

      <View style={styles.optionsList}>
        {INNER_STATES.map((state, index) => {
          const isLocked = !isPaid && !isDemo && index > 2;
          return (
            <Animated.View
              key={state.id}
              entering={FadeInUp.duration(350).delay(80 + index * 50)}
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
                accessibilityRole="button"
                accessibilityLabel={`${state.label}${isLocked ? ", requires Noor Plus" : ""}`}
                accessibilityHint={
                  isLocked
                    ? "Upgrade to Noor Plus to access this dua category"
                    : "Opens life context options for this inner state"
                }
                accessibilityState={{ disabled: isLocked }}
              >
                <View
                  style={[
                    styles.stateAccent,
                    { backgroundColor: theme.pillBackground },
                  ]}
                />
                <View
                  style={[
                    styles.stateIcon,
                    { backgroundColor: theme.pillBackground + "15" },
                  ]}
                >
                  <Feather
                    name={state.icon}
                    size={16}
                    color={theme.pillBackground}
                  />
                </View>
                <ThemedText style={styles.stateLabel}>{state.label}</ThemedText>
                {isLocked ? (
                  <Feather name="lock" size={14} color={theme.textSecondary} />
                ) : (
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={theme.textSecondary}
                  />
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.lg,
  },
  introTitle: {
    fontSize: typeScale.h2,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  introSubtitle: {
    fontSize: typeScale.body,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: Layout.hitTargets.minRowHeight,
    paddingHorizontal: container.cardPad,
    borderRadius: radii.sm,
  },
  optionText: {
    fontSize: typeScale.body,
  },
  stateCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: Layout.hitTargets.minRowHeight,
    paddingHorizontal: container.cardPad,
    borderRadius: radii.sm,
    gap: spacing.md,
    overflow: "hidden",
  },
  stateAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  stateIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
  stateLabel: {
    flex: 1,
    fontSize: typeScale.body,
  },
  duaCard: {
    padding: container.cardPad,
    borderRadius: radii.sm,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  ttsButton: {
    marginTop: spacing.sm,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 38,
    textAlign: "center",
    fontFamily: "serif",
  },
  translitContainer: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  transliteration: {
    textAlign: "center",
    fontStyle: "italic",
    fontSize: typeScale.small,
    lineHeight: 20,
  },
  englishContainer: {
    paddingHorizontal: spacing.sm,
  },
  englishText: {
    fontSize: typeScale.body,
    lineHeight: 22,
    textAlign: "center",
  },
  forStateCard: {
    flexDirection: "row",
    borderRadius: radii.sm,
    overflow: "hidden",
    marginTop: spacing.lg,
  },
  forStateAccent: {
    width: 3,
  },
  forStateText: {
    flex: 1,
    padding: container.cardPad,
    fontStyle: "italic",
    fontSize: typeScale.small,
  },
  doneContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
});

export default withScreenErrorBoundary(DuaScreen);
