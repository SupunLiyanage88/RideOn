import CustomButton from "@/components/CustomButton";
import { images } from "@/constants/images";
import { Slot } from "expo-router";
import React from "react";
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import LoginScreen from "./loginScreen";

export default function _layout() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="bg-white h-full"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full relative" style={{ height: Dimensions.get('screen').height/ 2.25 }}>
        <ImageBackground source={images.loginbg} className="size-full rounded-b-lg" resizeMode="repeat" />

        </View>
        <LoginScreen />
        <CustomButton />
      </ScrollView>
      <Slot />
    </KeyboardAvoidingView>
  );
}
