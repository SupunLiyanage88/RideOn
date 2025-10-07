
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search bikes, models, stations...",
  value,
  onChange,
  onSearch,
  isSearching,
  onFocus,
  onBlur,
  autoFocus = false,
}) => {
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isFocused, setIsFocused] = useState(false);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Keyboard is shown
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Keyboard is hidden
        inputRef.current?.blur();
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.01,
      useNativeDriver: true,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onBlur?.();
  };

  const handleClear = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue without feedback
    }
    onChange("");
    inputRef.current?.focus();
  };

  const handleSearch = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue without feedback
    }
    onSearch(value);
    Keyboard.dismiss();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.wrapper}>
          <Animated.View 
            style={[
              styles.container,
              isFocused && styles.containerFocused,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
          {/* Search Icon */}
          <View style={styles.searchIconContainer}>
            <FontAwesome6 
              name="magnifying-glass" 
              size={18} 
              color="#9CA3AF" 
            />
          </View>

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChange}
            onSubmitEditing={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            returnKeyType="search"
            autoFocus={autoFocus}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={true}
            clearButtonMode="never" // We'll use custom clear button
          />

          {/* Right Side Actions */}
          <View style={styles.actionsContainer}>
            {/* Loading Indicator */}
            {isSearching && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#37A77D" />
              </View>
            )}

            {/* Clear Button */}
            {value.length > 0 && !isSearching && (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome6 
                  name="xmark" 
                  size={18} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

          {/* Keyboard Dismiss Area */}
          <TouchableOpacity 
            style={styles.keyboardDismissArea}
            onPress={dismissKeyboard}
            activeOpacity={1}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    width: "100%",
  },
  wrapper: {
    width: "100%",
    position: "relative",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    width: "100%",
    minHeight: 52,
  },
  containerFocused: {
    borderColor: "#37A77D",
    shadowColor: "#37A77D",
    shadowOpacity: 0.15,
  },
  searchIconContainer: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "400",
    paddingVertical: 0, // Remove default padding for better control
    marginVertical: 0,
    includeFontPadding: false, // Android specific
    textAlignVertical: "center", // Android specific
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  loadingContainer: {
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  clearButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  searchButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  keyboardDismissArea: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    height: 0, // Invisible but touchable
  },
});

export default SearchInput;
