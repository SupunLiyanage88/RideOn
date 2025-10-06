
import React from "react";
import {
  StyleSheet,
  TextInput,
  View
} from "react-native";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search…",
  value,
  onChange,
  onSearch,
  isSearching,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={() => onSearch(value)}
        returnKeyType="search"
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B0C4DE", // Light blue
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
    maxWidth: 400,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default SearchInput;
