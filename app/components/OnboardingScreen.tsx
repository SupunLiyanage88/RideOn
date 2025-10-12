import { images } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

// Onboarding data
const onboardingData = [
  {
    id: "1",
    image: images.onboard01,
    title: "Welcome to RideOn",
    description: "Your perfect ride is just a tap away",
  },
  {
    id: "2",
    image: images.onboard02,
    title: "Safe & Reliable",
    description: "Travel with trusted drivers and real-time tracking",
  },
  {
    id: "3",
    image: images.onboard03,
    title: "Easy Payments",
    description: "Multiple payment options for your convenience",
  },
];

export default function OnboardingScreen({ onNext }: { onNext: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = new Animated.Value(0);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.slide}>
      {/* Illustration */}
      <Image
        source={item.image}
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex === onboardingData.length - 1) {
      onNext();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const flatListRef = React.useRef<FlatList>(null);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      {/* Header with logo and skip button */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={images.logoWithOutBg} style={styles.logos} />
          <Text style={styles.logoText}>RideOn</Text>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={onNext}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Pagination */}
      {renderPagination()}

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.nextText}>
          {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
        </Text>
        <Ionicons
          name={
            currentIndex === onboardingData.length - 1
              ? "checkmark"
              : "chevron-forward"
          }
          size={18}
          color="#fff"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logos: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#083A4C",
    marginLeft: 6,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: "#083A4C",
    fontWeight: "500",
  },
  slide: {
    width: screenWidth,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  illustration: {
    width: "100%",
    height: 400,
    marginTop: 60,
  },
  content: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#083A4C",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#083A4C",
    marginHorizontal: 4,
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#083A4C",
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 50,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
  },
});
