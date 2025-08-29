import CustomButton from "@/components/CustomButton";
import { images } from "@/constants/images";
import UseCurrentUser from "@/hooks/useCurrentUser";
import { Redirect, Slot } from "expo-router";
import React from "react";
import {
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
    ActivityIndicator,
    StyleSheet
} from "react-native";
import LoginScreen from "./loginScreen";

// Loader Component for both Android and iOS
const Loader = () => (
    <View style={styles.loaderContainer}>
        <View style={styles.loader}>
            <ActivityIndicator
                size={Platform.OS === 'ios' ? 'large' : 50}
                color={Platform.OS === 'ios' ? '#000' : '#3b82f6'}
            />
        </View>
    </View>
);

export default function _layout() {
    const { user, status } = UseCurrentUser();

    // Show loader while authentication status is pending
    if (status === 'pending') {
        return <Loader />;
    }

    const isAuthenticated = user;
    if (isAuthenticated) return <Redirect href="/(tabs)/search" />;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            style={styles.container}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loader: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.1)' : 'transparent',
    }
});