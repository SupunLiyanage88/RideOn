import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ToggleEnumButtonProps<T extends Record<string, string>> = {
  options: T;
  value: T[keyof T] | null;
  onChange: (value: T[keyof T]) => void;
};

const ToggleEnumButton = <T extends Record<string, string>>({
  options,
  value,
  onChange,
}: ToggleEnumButtonProps<T>) => {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 16, // mb-4
      }}
    >
      {(Object.keys(options) as Array<keyof T>).map((key) => {
        const option = options[key];
        const selected = value === option;

        return (
          <TouchableOpacity
            key={key as string}
            onPress={() => onChange(option)}
            style={{
              paddingHorizontal: 24, // px-6
              paddingVertical: 8, // py-2
              width: "100%",
              height: 56, // h-14
              borderRadius: 9999, // rounded-full
              borderWidth: 1,
              borderColor: selected ? "#0B4057" : "#D1D5DB", // border-secondary / border-gray-300
              marginBottom: 16, // mb-4
              justifyContent: "center",
              backgroundColor: selected ? "#0B4057" : "#FFFFFF", // bg-secondary / bg-white
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: selected ? "#FFFFFF" : "#000000", // text-white / text-black
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ToggleEnumButton;
