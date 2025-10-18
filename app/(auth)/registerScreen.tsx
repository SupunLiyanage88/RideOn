import { User, userRegister } from "@/api/auth";
import queryClient from "@/state/queryClient";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const RegisterScreen = () => {
  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<User>();

  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const userPassword = watch("password");
  const router = useRouter();

  // Focus states for modern input styling
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations when component mounts with stagger effect
    Animated.stagger(150, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getInputAnimationStyle = (delay = 0) => ({
    opacity: fadeAnim,
    transform: [
      {
        translateY: Animated.add(slideAnim, new Animated.Value(delay * 10)),
      },
    ],
  });

  const createFocusAnimation = () => {
    const focusAnim = useRef(new Animated.Value(1)).current;

    const animateOnFocus = () => {
      Animated.spring(focusAnim, {
        toValue: 1.02,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };

    const animateOnBlur = () => {
      Animated.spring(focusAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };

    return { focusAnim, animateOnFocus, animateOnBlur };
  };

  const { mutate: registerMutation, isPending } = useMutation({
    mutationFn: userRegister,
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await AsyncStorage.setItem("token", data?.token);
      console.log("Register successful:", data);
      alert("Register Successful");
      router.push("/(tabs)");
    },
    onError: (data) => {
      alert("Register Failed. Please check your credentials.");
      console.log(data);
    },
  });

  const handleRegister = (data: User) => {
    // Additional validation before submitting
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(data.mobile)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      alert("Please enter a valid email address");
      return;
    }

    console.log("Registration data:", data);
    registerMutation(data);
  };

  // Pulse animation for button when enabled
  useEffect(() => {
    if (!isPending) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScaleAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [isPending]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.formContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Welcome Header */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>
            Join us and start your ride journey
          </Text>
        </Animated.View>

        <Controller
          control={control}
          name="userName"
          rules={{
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters long",
            },
            maxLength: {
              value: 20,
              message: "Username cannot exceed 20 characters",
            },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message:
                "Username can only contain letters, numbers, and underscores",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <Animated.View
              style={[styles.inputContainer, getInputAnimationStyle(1)]}
            >
              <View
                style={[
                  styles.inputWrapper,
                  usernameFocused && styles.inputWrapperFocused,
                  errors?.userName && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={usernameFocused ? "#0B4057" : "#9ca3af"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Username"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  style={styles.textInput}
                  placeholderTextColor="#9ca3af"
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                />
              </View>
              {errors?.userName && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>
                    {errors.userName?.message}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        />
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            minLength: {
              value: 5,
              message: "Email must be at least 5 characters long",
            },
            maxLength: {
              value: 320,
              message: "Email cannot exceed 320 characters long",
            },
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email format",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused,
                  errors?.email && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailFocused ? "#0B4057" : "#9ca3af"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.textInput}
                  placeholderTextColor="#9ca3af"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
              {errors?.email && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.email?.message}</Text>
                </View>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="mobile"
          rules={{
            required: "Mobile number is required",
            maxLength: {
              value: 10,
              message: "Mobile number must be 10 digits",
            },
            minLength: {
              value: 10,
              message: "Mobile number must be 10 digits",
            },
            pattern: {
              value: /^[0-9]+$/,
              message: "Enter a valid mobile number (digits only)",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  mobileFocused && styles.inputWrapperFocused,
                  errors?.mobile && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={mobileFocused ? "#0B4057" : "#9ca3af"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Mobile Number"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  maxLength={10}
                  style={styles.textInput}
                  placeholderTextColor="#9ca3af"
                  onFocus={() => setMobileFocused(true)}
                  onBlur={() => setMobileFocused(false)}
                />
              </View>
              {errors?.mobile && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.mobile?.message}</Text>
                </View>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            maxLength: {
              value: 50,
              message: "Password cannot exceed 50 characters",
            },
            pattern: {
              value:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message:
                "Password must contain uppercase, lowercase, number, and special character",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused,
                  errors?.password && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? "#0B4057" : "#9ca3af"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={hidePassword}
                  style={styles.passwordInput}
                  placeholderTextColor="#9ca3af"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <Pressable
                  onPress={() => setHidePassword((v) => !v)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={hidePassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
              {errors?.password && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>
                    {errors.password?.message}
                  </Text>
                </View>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: "Please confirm your password",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            validate: {
              matchesPreviousPassword: (value) =>
                value === userPassword || "Passwords do not match",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  confirmPasswordFocused && styles.inputWrapperFocused,
                  errors?.confirmPassword && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={confirmPasswordFocused ? "#0B4057" : "#9ca3af"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={hideConfirmPassword}
                  style={styles.passwordInput}
                  placeholderTextColor="#9ca3af"
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                />
                <Pressable
                  onPress={() => setHideConfirmPassword((v) => !v)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={
                      hideConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
              {errors?.confirmPassword && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>
                    {errors.confirmPassword?.message}
                  </Text>
                </View>
              )}
            </View>
          )}
        />

        <Animated.View
          style={[
            styles.submitContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: buttonScaleAnim },
              ],
            },
          ]}
        >
          <Pressable
            disabled={isPending}
            onPress={() => {
              animateButtonPress();
              handleSubmit(handleRegister)();
            }}
            style={[
              styles.submitButton,
              styles.SignInButton,
              isPending && styles.submitButtonDisabled,
            ]}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* Terms footer */}
        <Animated.View
          style={[
            styles.footerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.footerText}>
            By creating an account, you agree to our{" "}
            <Text style={styles.linkText}>Terms of Service</Text> and{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 8,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0B4057",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "#f9fafb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: "#0B4057",
    backgroundColor: "#ffffff",
    shadowOpacity: 0.1,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    color: "#1f2937",
    fontSize: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: "#1f2937",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  submitContainer: {
    marginBottom: 20,
    marginTop: 12,
  },
  submitButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0B4057",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  SignInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B4057",
    borderRadius: 9999,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  footerText: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    paddingBottom: 50,
  },
  linkText: {
    color: "#0B4057",
    fontWeight: "500",
  },
});

export default RegisterScreen;
