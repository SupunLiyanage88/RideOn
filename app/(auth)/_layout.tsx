import ToggleButton from "@/app/components/toggleButton";
import { images } from "@/constants/images";
import UseCurrentUser from "@/hooks/useCurrentUser";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
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
  const [clickedRegister, setClickedRegister] = useState(false);

  if (status === "pending") {
    return <Loader />;
  }
  const isAuthenticated = user && status === "success";
  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView
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
            source={images.patternBg}
            resizeMode="cover"
            className="w-full h-full"
          />
        </View>

        <View
          className={`flex-1 bg-white rounded-t-[4rem] px-6 ${clickedLogin ? "-mt-14" : "-mt-36"}`}
        >
          <View className="mt-10 justify-center items-center">
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
            style={{
              height: clickedLogin ? 250 : 400,
              position: "relative",
            }}
          >
            {clickedLogin ? <LoginScreen /> : <RegisterScreen />}
          </View>
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}
