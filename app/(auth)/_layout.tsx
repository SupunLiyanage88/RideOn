import ToggleButton from "@/app/components/toggleButton";
import { images } from "@/constants/images";
import UseCurrentUser from "@/hooks/useCurrentUser";
import { useSlideAnimation } from "@/utils/animate.toggle.utils";
import { Redirect } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import LoginScreen from "./loginScreen";
import RegisterScreen from "./registerScreen";

const Loader = () => (
  <View className="flex-1 justify-center items-center bg-white">
    <View
      className="p-5 rounded-lg"
      style={{
        backgroundColor:
          Platform.OS === "ios" ? "rgba(0,0,0,0.1)" : "transparent",
      }}
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
  const offset = useSharedValue(0);
  const scrollViewRef = useRef(null);
  const loginStyle = useSlideAnimation(offset, "btn1");
  const registerStyle = useSlideAnimation(offset, "btn2");
  
  if (status === "pending") {
    return <Loader />;
  }
  const isAuthenticated = user && status === "success";
  if (isAuthenticated) return <Redirect href="/(tabs)" />;
  const handleToggle = (login: boolean) => {
    if (clickedLogin === login) return;
    setClickedLogin(login);
    offset.value = withTiming(login ? 0 : 1, { duration: 300 });
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View
          className="w-full relative"
          style={{ height: Dimensions.get("screen").height / 2.25 }}
        >
          <ImageBackground
            source={images.loginbg}
            resizeMode="cover"
            className="w-full h-full"
          />
        </View>

        <View
          className={`flex-1 bg-white rounded-t-[4rem] px-6 ${clickedLogin ? "-mt-14" : "-mt-24"}`}
        >
          <View className="mt-10 justify-center items-center">
            <ToggleButton
              leftLabel="Login"
              rightLabel="Register"
              click01={clickedLogin}
              click02={!clickedLogin}
              onToggle={(login) => handleToggle(login)}
            />
          </View>

          <View
            style={{
              height: clickedLogin ? 250 : 400,
              position: "relative",
            }}
          >
            <Animated.View style={loginStyle}>
              <LoginScreen />
            </Animated.View>
            <Animated.View style={registerStyle}>
              <RegisterScreen />
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}
