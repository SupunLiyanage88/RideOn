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
    <View className="flex flex-wrap mb-4">
      {(Object.keys(options) as Array<keyof T>).map((key) => {
        const option = options[key];
        const selected = value === option;

        return (
          <TouchableOpacity
            key={key as string}
            onPress={() => onChange(option)}
            className={`px-6 w-full py-2 rounded-full border mb-4 h-14 justify-center ${
              selected ? "bg-secondary border-secondary" : "bg-white border-gray-300"
            }`}
          >
            <Text className={`${selected ? "text-white" : "text-black"}`}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ToggleEnumButton;
