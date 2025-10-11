import { User, userRegister } from "@/api/auth";
import queryClient from "@/state/queryClient";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import HelperText from "../components/HelperText";

const RegisterScreen = () => {
  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<User>();

  const [hidePassword, setHidePassword] = useState(true);
  const [password, setPassword] = useState(true);
  const userPassword = watch("password");
  console.log("User Password:", userPassword);
  const router = useRouter();

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
    console.log(data);
    registerMutation(data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="userName"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="User Name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                style={styles.textInput}
                placeholderTextColor="#9ca3af"
                {...register("userName", {
                  required: {
                    value: true,
                    message: "User Name is required",
                  },
                })}
              />
              <HelperText
                visible={!!errors.userName}
                message={errors.userName?.message}
                type="error"
              />
            </View>
          )}
        />
        <Controller
          control={control}
          name="email"
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
                {...register("email", {
                  required: {
                    value: true,
                    message: "Email is required",
                  },
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
                })}
              />
              <HelperText
                visible={!!errors.email}
                message={errors.email?.message}
                type="error"
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="mobile"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Mobile"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="number-pad"
                style={styles.textInput}
                placeholderTextColor="#9ca3af"
                {...register("mobile", {
                  required: {
                    value: true,
                    message: "Mobile number is required",
                  },
                  maxLength: {
                    value: 10,
                    message: "Mobile number must be at least 10 digits",
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Enter a valid mobile number (digits only)",
                  },
                })}
              />
              <HelperText
                visible={!!errors.mobile}
                message={errors.mobile?.message}
                type="error"
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={password}
                  style={styles.passwordInput}
                  placeholderTextColor="#9ca3af"
                  {...register("password", {
                    required: {
                      value: true,
                      message: "Password is required",
                    },
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                />
              </View>
              <HelperText
                visible={!!errors.password}
                message={errors.password?.message}
                type="error"
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={hidePassword}
                  style={styles.passwordInput}
                  placeholderTextColor="#9ca3af"
                  {...register("confirmPassword", {
                    required: {
                      value: true,
                      message: "Confirm Password is required",
                    },
                    validate: {
                      matchesPreviousPassword: (value) =>
                        value === userPassword || "Passwords do not match",
                    },
                  })}
                />
                <Pressable onPress={() => setHidePassword((v) => !v)}>
                  <Ionicons 
                    name={hidePassword ? "eye" : "eye-off-outline"} 
                    size={24} 
                    color="black" 
                  />
                </Pressable>
              </View>
              <HelperText
                visible={!!errors.confirmPassword}
                message={errors.confirmPassword?.message}
                type="error"
              />
            </View>
          )}
        />

        <View style={styles.submitContainer}>
          <Pressable
            onPress={handleSubmit(handleRegister)}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Register</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

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
    backgroundColor: '#0B4057',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;