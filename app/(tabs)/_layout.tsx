import { Fontisto } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

const TabIcon = () => {
  const isAuthenticated = false;

  if (!isAuthenticated) return <Redirect href="/loginScreen" />;

  return (
    <View className="">
      <Fontisto name="home" size={24} color="#37A77D" />
      {/* <Text>Home</Text> */}
    </View>
  );
};

const _layout = () => {
  return (
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="reward"
          options={{
            title: "Reward",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="sos"
          options={{
            title: "SOS",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="me"
          options={{
            title: "Me",
            headerShown: false,
          }}
        />
      </Tabs>
  );
};

export default _layout;
