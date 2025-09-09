import { User, userRegister } from "@/api/auth";
import queryClient from "@/state/queryClient";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
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
    <View className="flex-1 items-center mt-10 px-5">
      <View className="w-full max-w-md rounded-2xl p-1">
        <Controller
          control={control}
          name="userName"
          render={({ field: { onChange, value } }) => (
            <View className="mb-6">
              <TextInput
                placeholder="User Name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                className="w-full rounded-xl border border-zinc-200 px-4 py-4 text-zinc-900"
                placeholderTextColor="#9ca3af"
                {...register("mobile", {
                  required: {
                    value: true,
                    message: "User Name is required",
                  },
                  maxLength: {
                    value: 4,
                    message: "User Name must be at least 4 digits",
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
            <View className="mb-6">
              <TextInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                className="w-full rounded-xl border border-zinc-200 px-4 py-4 text-zinc-900"
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
            <View className="mb-6">
              <TextInput
                placeholder="Mobile"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="number-pad"
                className="w-full rounded-xl border border-zinc-200 px-4 py-4 text-zinc-900"
                placeholderTextColor="#9ca3af"
                {...register("mobile", {
                  required: {
                    value: true,
                    message: "Mobile number is required",
                  },
                  maxLength: {
                    value: 10,
                    message: "Mobile number must be at least 6 digits",
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
            <View className="mb-6">
              <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                <TextInput
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={password}
                  className="flex-1 py-4 text-zinc-900"
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
            <View className="mb-6">
              <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                <TextInput
                  placeholder="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={hidePassword}
                  className="flex-1 py-4 text-zinc-900"
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
                  <Text className="text-zinc-500">
                    {hidePassword ? (
                      <Ionicons name="eye" size={24} color="black" />
                    ) : (
                      <Ionicons
                        name="eye-off-outline"
                        size={24}
                        color="black"
                      />
                    )}
                  </Text>
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

        <View className="flex-row justify-center">
          <Pressable
            onPress={handleSubmit(handleRegister)}
            className="w-full rounded-full py-3 items-center justify-center bg-[#0B4057]"
          >
            <Text className="text-white text-center font-bold">Register</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;
