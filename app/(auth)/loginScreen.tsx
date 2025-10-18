import { login } from "@/api/auth";
import queryClient from "@/state/queryClient";
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

type FormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await AsyncStorage.setItem("token", data?.token);
      console.log("Login successful:", data);
      alert("Login Successful");
      router.push("/(tabs)");
    },
    onError: (data) => {
      alert("Login Failed. Please check your credentials.");
      console.log(data);
    },
  });

  const handleLogin = (data: FormData) => {
    loginMutation(data);
  };
  const [hidePassword, setHidePassword] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations when component mounts with stagger effect
    Animated.stagger(100, [
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
        tension: 100,
        friction: 8,
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

  // Pulse animation for button when enabled
  useEffect(() => {
    if (!isPending) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScaleAnim, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScaleAnim, {
            toValue: 1,
            duration: 1500,
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
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.formContainer,
          {
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Welcome Header */}
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to continue your journey</Text>
        </Animated.View>

        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
                errors?.email && styles.inputWrapperError
              ]}>
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
                  <Text style={styles.errorText}>
                    {errors.email.message}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        />

        {/* Password */}
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: { value: 6, message: "Min 6 characters" },
          }}
          render={({ field: { onChange, value } }) => (
            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
                errors?.password && styles.inputWrapperError
              ]}>
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
                <Pressable onPress={() => setHidePassword((v) => !v)} style={styles.eyeIcon}>
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
                    {errors.password.message}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        />

        {/* Submit */}
        <Animated.View 
          style={[
            styles.submitContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: buttonScaleAnim }]
            }
          ]}
        >
          <Pressable
            disabled={isPending}
            onPress={() => {
              animateButtonPress();
              handleSubmit(handleLogin)();
            }}
            style={[
              styles.submitButton,
              styles.SignInButton,
              isPending && styles.submitButtonDisabled
            ]}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* Subtle footer */}
        <Animated.View 
          style={[
            styles.footerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0B4057',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#f9fafb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: '#0B4057',
    backgroundColor: '#ffffff',
    shadowOpacity: 0.1,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    color: '#1f2937',
    fontSize: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    color: '#1f2937',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 32,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#0B4057',
    fontSize: 14,
    fontWeight: '500',
  },
  submitContainer: {
    marginVertical: 24,
  },
  submitButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0B4057',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B4057',
    borderRadius: 9999,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  linkText: {
    color: '#0B4057',
    fontWeight: '500',
  },
});