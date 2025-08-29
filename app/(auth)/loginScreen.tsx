import { login } from "@/api/auth";
import queryClient from "@/state/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput, View } from "react-native";

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
      router.push("/(tabs)/search");
    },
    onError: (data) => {
      alert("Login Failed. Please check your credentials.");
      console.log(data)
    },
  });

  const handleLogin = (data: FormData) => {
    loginMutation(data);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

      <Controller
        control={control}
        name="email"
        rules={{ required: "Email is required" }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              style={{ borderWidth: 1, marginBottom: 5, padding: 8 }}
            />
            {errors.email && (
              <Text style={{ color: "red", marginBottom: 10 }}>
                {errors.email.message}
              </Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required" }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              style={{ borderWidth: 1, marginBottom: 5, padding: 8 }}
            />
            {errors.password && (
              <Text style={{ color: "red", marginBottom: 10 }}>
                {errors.password.message}
              </Text>
            )}
          </>
        )}
      />

      <Button
        title={isPending ? "Logging in..." : "Login"}
        onPress={handleSubmit(handleLogin)}
        disabled={isPending}
      />
    </View>
  );
}
