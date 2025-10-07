import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface SearchbarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  backgroundColor?: string;
  textColor?: string;
  placeholderColor?: string;
  iconColor?: string;
  borderRadius?: number;
  padding?: number;
}

const Searchbar: React.FC<SearchbarProps> = ({
  placeholder = "Search Here",
  value,
  onChangeText,
  onSubmitEditing,
  backgroundColor = "#0B4057",
  textColor = "white",
  placeholderColor = "#ccc",
  iconColor = "white",
  borderRadius = 999,
  padding = 8,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderRadius,
          padding,
        }
      ]}
    >
      <Ionicons
        name="search"
        size={24}
        color={iconColor}
        style={styles.icon}
      />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        style={[
          styles.textInput,
          {
            color: textColor,
          }
        ]}
        placeholderTextColor={placeholderColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
  },
});

export default Searchbar;