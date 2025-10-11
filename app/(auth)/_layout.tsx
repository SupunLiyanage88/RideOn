import OnboardingScreen from "@/app/components/OnboardingScreen";
import ToggleButton from "@/app/components/toggleButton";
import { images } from "@/constants/images";
import UseCurrentUser from "@/hooks/useCurrentUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

  useEffect(() => {
    checkOnboardingStatus();
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
            source={images.patternBg}
            resizeMode="cover"
            style={styles.backgroundImage}
          />
        </View>

        <View
          style={[
            styles.contentContainer,
            { marginTop: clickedLogin ? -56 : -144 },
          ]}
        >
          <View style={styles.toggleContainer}>
            <ToggleButton
              leftLabel="Login"
              rightLabel="Register"
              click01={clickedLogin}
              click02={clickedRegister}
              onToggle={(left, right) => {
                setClickedLogin(left);
                setClickedRegister(right);
              }}
            />
          </View>

          <View
            style={[styles.formContainer, { height: clickedLogin ? 250 : 400 }]}
          >
            {clickedLogin ? <LoginScreen /> : <RegisterScreen />}
          </View>
        </View>
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
  },
});
