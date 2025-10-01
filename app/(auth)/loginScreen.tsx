import { login } from "@/api/auth";
import queryClient from "@/state/queryClient";
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
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
  
  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
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
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.textInput}
                placeholderTextColor="#9ca3af"
              />
              {errors?.email && (
                <Text style={styles.errorText}>
                  {errors.email.message}
                </Text>
              )}
            </View>
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
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={hidePassword}
                  style={styles.passwordInput}
                  placeholderTextColor="#9ca3af"
                />
                <Pressable onPress={() => setHidePassword((v) => !v)}>
                  <Ionicons 
                    name={hidePassword ? "eye" : "eye-off-outline"} 
                    size={24} 
                    color="black" 
                  />
                </Pressable>
              </View>
              {errors?.password && (
                <Text style={styles.errorText}>
                  {errors.password.message}
                </Text>
              )}
            </View>
          )}
        />
        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </View>

        {/* Submit */}
        <View style={styles.submitContainer}>
          <Pressable
            disabled={isPending}
            onPress={handleSubmit(handleLogin)}
            style={[
              styles.submitButton,
              isPending ? styles.submitButtonDisabled : styles.submitButtonEnabled
            ]}
          >
            {isPending ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.submitButtonText}>Login</Text>
            )}
          </Pressable>
        </View>

        {/* Subtle footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#18181b',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    color: '#18181b',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 4,
  },
  forgotPasswordContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  forgotPasswordText: {
    color: '#6b7280',
    fontSize: 12,
  },
  submitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButton: {
    width: '100%',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonEnabled: {
    backgroundColor: '#0B4057',
  },
  submitButtonDisabled: {
    backgroundColor: '#d4d4d4',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
  },
});