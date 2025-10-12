import UseCurrentUser from "@/hooks/useCurrentUser";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabIconProps = {
  focused: boolean;
  icon: any;
  title: string;
  disableAnimation?: boolean;
};

const TabIcon = ({ focused, icon, title, disableAnimation = false }: TabIconProps) => {
  const scale = useRef(new Animated.Value(focused ? 1.1 : 0.9)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.7)).current;
  const translateY = useRef(new Animated.Value(focused ? -3 : 0)).current;

  useEffect(() => {
    if (disableAnimation) {
      // Set values directly without animation for SOS tab
      scale.setValue(1);
      opacity.setValue(focused ? 1 : 0.7);
      translateY.setValue(0);
      return;
    }

    const animations = [
      Animated.spring(scale, {
        toValue: focused ? 1.1 : 0.9,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: focused ? -3 : 0,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();
  }, [focused, scale, opacity, translateY, disableAnimation]);

  // Create interpolated values for text animation (only if animation is enabled)
  const textOpacity = disableAnimation 
    ? (focused ? 1 : 0.7)
    : opacity.interpolate({
        inputRange: [0.7, 1],
        outputRange: [0.8, 1],
        extrapolate: 'clamp',
      });

  const textScale = disableAnimation 
    ? 1
    : scale.interpolate({
        inputRange: [0.9, 1.1],
        outputRange: [0.95, 1],
        extrapolate: 'clamp',
      });

  if (disableAnimation) {
    // Render without animations for SOS tab
    return (
      <View style={styles.tabIcon}>
        <View style={{ opacity: focused ? 1 : 0.7 }}>
          <Ionicons name={icon} size={23} color={focused ? "#37A77D" : "#ffffff"} />
        </View>
        <Animated.Text
          style={[
            styles.tabText,
            focused ? styles.textPrimary : styles.textWhite,
            { opacity: textOpacity },
          ]}
        >
          {title}
        </Animated.Text>
      </View>
    );
  }

  return (
    <View style={styles.tabIcon}>
      <Animated.View
        style={[
          {
            transform: [
              { scale },
              { translateY },
            ],
            opacity,
          },
        ]}
      >
        <Ionicons name={icon} size={23} color={focused ? "#37A77D" : "#ffffff"} />
      </Animated.View>
      <Animated.Text
        style={[
          styles.tabText,
          focused ? styles.textPrimary : styles.textWhite,
          {
            opacity: textOpacity,
            transform: [{ scale: textScale }],
          },
        ]}
      >
        {title}
      </Animated.Text>
    </View>
  );
};

const _layout = () => {
  const { user, status } = UseCurrentUser();
  const insets = useSafeAreaInsets();

  const isAuthenticated = user && status === "success";
  const isAdmin = user?.role === "Admin";

  if (!isAuthenticated) return <Redirect href="/loginScreen" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height:
            Platform.OS === "android" ? 65 + insets.bottom : 70 + insets.bottom,
          paddingTop: 10,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#0B4057",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        animation: 'fade',
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Home" icon="home-outline" focused={focused} />
          ),
        }}
      />

      {/* Search */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Search" icon="search-outline" focused={focused} />
          ),
        }}
      />

      {/* Reward */}
      <Tabs.Screen
        name="reward"
        options={{
          title: "reward",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Plans" icon="gift-outline" focused={focused} />
          ),
        }}
      />

      {/* SOS */}
      <Tabs.Screen
        name="sos"
        options={{
          title: "SOS",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              title="SOS"
              icon="alert-circle-outline"
              focused={focused}
              disableAnimation={true}
            />
          ),
        }}
      />

      {/* Me */}
      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Me" icon="person-outline" focused={focused} />
          ),
        }}
      />

      {/* Admin */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? "/admin" : null,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Admin" icon="settings-outline" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#0B4057",
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  textPrimary: {
    color: "#37A77D",
  },
  textWhite: {
    color: "#ffffff",
  },
});
