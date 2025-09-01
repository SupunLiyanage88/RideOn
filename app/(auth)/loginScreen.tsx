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
  Text,
  TextInput,
  View
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
    <View className="flex-1 items-center mt-10 px-5">
      <View className="w-full max-w-md rounded-2xl p-1 ">
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
            <View className="mb-6">
              <TextInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                className="w-full rounded-xl border border-zinc-200 px-4 py-4 text-zinc-900"
                placeholderTextColor="#9ca3af"
              />
              {errors?.email && (
                <Text className="text-red-500 mt-1">
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
            <View className="mb-2">
              <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                <TextInput
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={hidePassword}
                  className="flex-1 py-4 text-zinc-900"
                  placeholderTextColor="#9ca3af"
                />
                <Pressable onPress={() => setHidePassword((v) => !v)}>
                  <Text className="text-zinc-500">
                    {hidePassword ? <Ionicons name="eye" size={24} color="black" /> : <Ionicons name="eye-off-outline" size={24} color="black" />}
                  </Text>
                </Pressable>
              </View>
              {errors?.password && (
                <Text className="text-red-500 mt-1">
                  {errors.password.message}
                </Text>
              )}
            </View>
          )}
        />
        <View className="justify-end items-end mb-10">
          <Text className="text-zinc-500 text-xs">Forgot Password?</Text>
        </View>

        {/* Submit */}
        <View className="flex-row justify-center">
          <Pressable
            disabled={isPending}
            onPress={handleSubmit(handleLogin)}
            className={`w-full rounded-full py-3 items-center justify-center ${
              isPending ? "bg-zinc-300" : "bg-[#0B4057]"
            }`}
          >
            {isPending ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-white font-medium">Login</Text>
            )}
          </Pressable>
        </View>

        {/* Subtle footer */}
        <View className="items-center mt-4">
          <Text className="text-zinc-500 text-xs">
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}
