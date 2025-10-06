// AutoComplete.tsx
import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface Option {
  label: string;
  value: string | number;
}

interface AutoCompleteProps {
  value?: string | number;
  onChange: (val: string | number | "") => void;
  data: Option[];
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  error?: string;

  // 🔹 Custom Styles
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  dropdownStyle?: ViewStyle;
  optionStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorTextStyle?: TextStyle;
  placeholderTextColor?: string;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  value,
  onChange,
  data,
  label,
  placeholder = "Select option",
  searchable = true,
  error,

  containerStyle,
  inputContainerStyle,
  inputStyle,
  dropdownStyle,
  optionStyle,
  labelStyle,
  errorTextStyle,
  placeholderTextColor,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel = value
    ? data.find((d) => d.value === value)?.label || ""
    : "";

  const filteredData = searchable
    ? data.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <View style={[{ marginVertical: 8 }, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      {/* Input with Down Arrow & Clear Icon */}
      <TouchableOpacity activeOpacity={1} onPress={() => setOpen((prev) => !prev)}>
        <View
          style={[
            styles.inputContainer,
            error && { borderColor: "red" },
            inputContainerStyle,
          ]}
        >
          <TextInput
            style={[styles.input, inputStyle]}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor || "#999"}
            value={search !== "" ? search : selectedLabel}
            onChangeText={(text) => {
              setSearch(text);
              if (text === "") {
                onChange("");
              }
              if (!open) setOpen(true);
            }}
          />

          {/* Clear (X) Icon */}
          {(search !== "" || selectedLabel) && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                onChange("");
              }}
              style={{ marginRight: 10 }}
            >
              <AntDesign name="close" size={16} color="gray" />
            </TouchableOpacity>
          )}

          {/* Dropdown Arrow */}
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown list below input */}
      {open && (
        <View style={[styles.dropdown, dropdownStyle]}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, optionStyle]}
                onPress={() => {
                  onChange(item.value);
                  setSearch("");
                  setOpen(false);
                }}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.noData}>No results</Text>}
          />
        </View>
      )}

      {error && (
        <Text style={[styles.errorText, errorTextStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default AutoComplete;

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 200,
    backgroundColor: "#fff",
    zIndex: 999,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  noData: {
    textAlign: "center",
    padding: 10,
    color: "#888",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
