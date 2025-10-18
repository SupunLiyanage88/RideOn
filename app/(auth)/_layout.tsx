import OnboardingScreen from "@/app/components/OnboardingScreen";
import ToggleButton from "@/app/components/toggleButton";
import { images } from "@/constants/images";
import UseCurrentUser from "@/hooks/useCurrentUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LoginScreen from "./loginScreen";
import RegisterScreen from "./registerScreen";

const Loader = () => (
  <View style={styles.loaderContainer}>
    <View
      style={[
        styles.loaderContent,
        {
          backgroundColor:
            Platform.OS === "ios" ? "rgba(0,0,0,0.1)" : "transparent",
        },
      ]}
    >
      <ActivityIndicator
        size={Platform.OS === "ios" ? "large" : 50}
        color={Platform.OS === "ios" ? "#000" : "#3b82f6"}
      />
    </View>
  </View>
);

export default function _layout() {
  const { user, status } = UseCurrentUser();

  const [clickedLogin, setClickedLogin] = useState(true);
  const [clickedRegister, setClickedRegister] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animation for smooth transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const loginOpacity = useRef(new Animated.Value(1)).current;
  const registerOpacity = useRef(new Animated.Value(0)).current;
  const backgroundShiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkOnboardingStatus();
    
    // Initialize opacity values based on initial state
    loginOpacity.setValue(clickedLogin ? 1 : 0);
    registerOpacity.setValue(clickedRegister ? 1 : 0);
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      setShowOnboarding(hasSeenOnboarding === null);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      setShowOnboarding(false);
    }
  };

  if (status === "pending" || showOnboarding === null) {
    return <Loader />;
  }

  const isAuthenticated = user && status === "success";
  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  if (showOnboarding) {
    return <OnboardingScreen onNext={handleOnboardingComplete} />;
  }

  return (
    <KeyboardAwareScrollView
      style={styles.keyboardScrollView}
      contentContainerStyle={styles.keyboardContentContainer}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.imageContainer}>
          <ImageBackground
            source={images.loginbg}
            resizeMode="cover"
            style={styles.backgroundImage}
          />
        </View>

        <Animated.View
          style={[
            styles.contentContainer,
            { 
              marginTop: clickedLogin ? -56 : -144,
              transform: [
                { scale: scaleAnim },
                { translateY: backgroundShiftAnim }
              ]
            },
          ]}
        >
          <Animated.View 
            style={[
              styles.toggleContainer,
              {
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <ToggleButton
              leftLabel="Login"
              rightLabel="Register"
              click01={clickedLogin}
              click02={clickedRegister}
              onToggle={(left, right) => {
                if (isTransitioning) return; // Prevent multiple transitions
                
                setIsTransitioning(true);
                // Smooth native animations without height conflicts

                // Start native animations (native thread)
                Animated.parallel([
                  // Container fade effect
                  Animated.sequence([
                    Animated.timing(fadeAnim, {
                      toValue: 0.9,
                      duration: 150,
                      useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                      toValue: 1,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                  ]),
                  // Fade out current screen
                  Animated.timing(left ? registerOpacity : loginOpacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                  }),
                  // Fade in new screen
                  Animated.timing(left ? loginOpacity : registerOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                  }),
                  // Scale animation
                  Animated.sequence([
                    Animated.timing(scaleAnim, {
                      toValue: 0.98,
                      duration: 150,
                      useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                      toValue: 1,
                      tension: 100,
                      friction: 8,
                      useNativeDriver: true,
                    }),
                  ]),
                  // Slide animation
                  Animated.sequence([
                    Animated.timing(slideAnim, {
                      toValue: left ? -15 : 15,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                      toValue: 0,
                      duration: 250,
                      useNativeDriver: true,
                    }),
                  ]),
                  // Background parallax effect
                  Animated.sequence([
                    Animated.timing(backgroundShiftAnim, {
                      toValue: left ? -5 : 5,
                      duration: 300,
                      useNativeDriver: true,
                    }),
                    Animated.timing(backgroundShiftAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                  ]),
                ]).start(() => {
                  setClickedLogin(left);
                  setClickedRegister(right);
                  setIsTransitioning(false);
                });
              }}
            />
          </Animated.View>

          <Animated.View style={[
            styles.formContainer,
            { 
              minHeight: clickedLogin ? 350 : 520, // Use static values for smooth height changes
              overflow: 'hidden', // Prevent content overflow during transitions
              opacity: fadeAnim, // Add subtle container fade
            }
          ]}>
            {/* Login Screen with individual opacity and transform */}
            <Animated.View style={[
              styles.screenContainer,
              { 
                opacity: loginOpacity,
                position: clickedLogin ? 'relative' : 'absolute',
                width: '100%',
                zIndex: clickedLogin ? 1 : 0,
                transform: [
                  { translateX: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}>
              <LoginScreen />
            </Animated.View>

            {/* Register Screen with individual opacity and transform */}
            <Animated.View style={[
              styles.screenContainer,
              { 
                opacity: registerOpacity,
                position: clickedRegister ? 'relative' : 'absolute',
                width: '100%',
                top: 0,
                zIndex: clickedRegister ? 1 : 0,
                transform: [
                  { translateX: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}>
              <RegisterScreen />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loaderContent: {
    padding: 20,
    borderRadius: 8,
  },
  keyboardScrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardContentContainer: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  imageContainer: {
    width: "100%",
    height: Dimensions.get("screen").height / 2.25,
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 64,
    borderTopRightRadius: 64,
    paddingHorizontal: 24,
  },
  toggleContainer: {
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    position: "relative",
    justifyContent: 'flex-start',
  },
  screenContainer: {
    flex: 1,
    width: '100%',
  },
});
