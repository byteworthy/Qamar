import React, { useRef, useEffect } from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { NoorColors } from "@/constants/theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_GAP = 16;

interface Feature {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: "book-open",
    title: "Quran with Audio",
    description: "8 reciters, tajweed colors, word-by-word highlighting",
  },
  {
    icon: "book",
    title: "Hifz Memorization",
    description: "Spaced repetition with personalized feedback",
  },
  {
    icon: "message-square",
    title: "Arabic Tutor",
    description: "Coaching for vocabulary, grammar & conversation",
  },
  {
    icon: "clock",
    title: "Prayer Times",
    description: "Precise times and qibla direction for your location",
  },
];

export function FeaturePreviewCarousel() {
  const listRef = useRef<FlatList>(null);
  const currentRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      currentRef.current = (currentRef.current + 1) % FEATURES.length;
      listRef.current?.scrollToIndex({
        index: currentRef.current,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container} testID="feature-preview-carousel">
      <FlatList
        ref={listRef}
        data={FEATURES}
        keyExtractor={(item) => item.title}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.content}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + CARD_GAP,
          offset: (CARD_WIDTH + CARD_GAP) * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.duration(300).delay(index * 80)}
            style={styles.card}
          >
            <View style={styles.iconRing}>
              <Feather name={item.icon} size={34} color={NoorColors.gold} />
            </View>
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={styles.desc}>{item.description}</ThemedText>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 210,
    marginVertical: 20,
  },
  content: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(212,175,55,0.08)",
  },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(212,175,55,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.65,
  },
});
