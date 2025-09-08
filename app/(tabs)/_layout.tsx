import UseCurrentUser from "@/hooks/useCurrentUser";
import Ionicons from "@expo/vector-icons/Ionicons";
import cn from "clsx";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabIconProps = {
  focused: boolean;
  icon: any;
  title: string;
};

const TabIcon = ({ focused, icon, title }: TabIconProps) => {
  return (
    <View className="tab-icon ">
      <Ionicons name={icon} size={28} color={focused ? "#37A77D" : "#ffffff"} />
      <Text
        className={cn(
          "text-sm font-bold",
          focused ? "text-primary" : "text-white"
        )}
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
          height: Platform.OS === "android" ? 110 : 90,
          paddingBottom: Platform.OS === "android" ? insets.bottom : 0,
          position: "absolute",
          left: 0,
          right: 0,
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
      {/* <Tabs.Screen
        name="admin"
        options={{
          href: null, // 👈 hides it from the tab bar
        }}
      /> */}

      {/* Me */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? "/admin" : null,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Admin" icon="person-outline" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
