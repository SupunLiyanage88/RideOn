import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

interface TabIndicatorProps {
  activeTabIndex: number;
  totalTabs: number;
}

const TabIndicator: React.FC<TabIndicatorProps> = ({ activeTabIndex, totalTabs }) => {
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / totalTabs;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeTabIndex * tabWidth,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [activeTabIndex, tabWidth, translateX]);

  return (
    <View style={[styles.container, { width: tabWidth }]}>
      <Animated.View
        style={[
          styles.indicator,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    height: 3,
    alignItems: "center",
  },
  indicator: {
    width: 30,
    height: 3,
    backgroundColor: "#37A77D",
    borderRadius: 2,
  },
});

export default TabIndicator;