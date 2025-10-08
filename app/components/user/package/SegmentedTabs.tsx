import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

export type SegmentedOption = { key: string; label: string };

interface SegmentedTabsProps {
  options: SegmentedOption[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
}

const SegmentedTabs: React.FC<SegmentedTabsProps> = ({ options, activeKey, onChange, style }) => {
  return (
    <View style={[styles.wrap, style]}>
      {options.map((opt) => {
        const active = opt.key === activeKey;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[styles.tab, active ? styles.tabActive : styles.tabInactive]}
            activeOpacity={0.9}
          >
            <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    padding: 4,
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#083A4C",
  },
  tabInactive: {
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
  },
  textActive: {
    color: "#FFFFFF",
  },
  textInactive: {
    color: "#374151",
  },
});

export default SegmentedTabs;
