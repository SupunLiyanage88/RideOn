import UseCurrentUser from "@/hooks/useCurrentUser";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabIconProps = {
  focused: boolean;
  icon: any;
  title: string;
};

const TabIcon = ({ focused, icon, title }: TabIconProps) => {
  return (
    <View style={styles.tabIcon}>
      <Ionicons name={icon} size={23} color={focused ? "#37A77D" : "#ffffff"} />
      <Text
        style={[
          styles.tabText,
          focused ? styles.textPrimary : styles.textWhite,
        ]}
      >
        {title}
      </Text>
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
        },
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
          title: "Reward",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Reward" icon="gift-outline" focused={focused} />
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
  },
  tabText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  textPrimary: {
    color: "#37A77D",
  },
  textWhite: {
    color: "#ffffff",
  },
});
