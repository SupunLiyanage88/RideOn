import { saveBikeByUser } from "@/api/bike";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HelperText from "../../HelperText";

const { width: screenWidth } = Dimensions.get("window");

interface BikeFormData {
  bikeModel: string;
  fuelType: string;
  distance: string;
  condition: string;
}

const AddUserBikes = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BikeFormData>({
    defaultValues: {
      bikeModel: "",
      fuelType: "",
      distance: "0",
      condition: "100",
    },
    mode: "onChange",
  });

  const { mutate: saveBikeMutation, isPending } = useMutation({
    mutationFn: saveBikeByUser,
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-bikes"] });
      console.log("User bike submission successful:", data);
      
      Alert.alert(
        "Bike Submitted Successfully! 🚴‍♂️",
        "Your bike has been submitted for review. The RideOn team will approve it and assign it to a station within 24-48 hours. You'll receive a notification once it's ready!",
        [
          {
            text: "Great!",
            onPress: () => {
              reset();
              router.back();
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        "Submission Failed",
        error?.response?.data?.message || "Failed to submit bike. Please try again.",
        [{ text: "OK" }]
      );
      console.log("Error:", error);
    },
  });

  const handleSubmitBike = (data: BikeFormData) => {
    const formattedData = {
      ...data,
      availability: true,
      assigned: false,
      rentApproved: false,
    };
    
    console.log("Submitting bike data:", formattedData);
    saveBikeMutation(formattedData as any);
  };

  const fuelTypes = [
    { label: "Electric", value: "Electric", color: "#10b981", icon: "⚡" },
    { label: "Pedal", value: "Pedal", color: "#3b82f6", icon: "🚴" },
  ];

  const getConditionColor = (value: string) => {
    const numValue = parseInt(value || "0");
    if (numValue >= 80) return "#10b981";
    if (numValue >= 60) return "#f59e0b";
    if (numValue >= 40) return "#f97316";
    return "#ef4444";
  };

  const getConditionLabel = (value: string) => {
    const numValue = parseInt(value || "0");
    if (numValue >= 90) return "Excellent";
    if (numValue >= 80) return "Very Good";
    if (numValue >= 70) return "Good";
    if (numValue >= 60) return "Fair";
    if (numValue >= 40) return "Poor";
    return "Very Poor";
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFB" }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {/* Custom Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 16,
              backgroundColor: "#ffffff",
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: pressed ? "#f3f4f6" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Ionicons name="arrow-back" size={24} color="#083A4C" />
            </Pressable>

            <View style={{ alignItems: "center", flex: 1, marginHorizontal: 16 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#083A4C",
                  letterSpacing: -0.5,
                }}
              >
                Add Your Bike
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                Share your bike with the community
              </Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Process Info Banner */}
          <View
            style={{
              backgroundColor: "#EBF4FF",
              marginHorizontal: 20,
              marginTop: 20,
              padding: 16,
              borderRadius: 16,
              borderLeftWidth: 4,
              borderLeftColor: "#083A4C",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color="#083A4C"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#083A4C",
                }}
              >
                How it works
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: "#374151",
                lineHeight: 20,
              }}
            >
              1. Fill out the bike details below{"\n"}
              2. Submit for review by our team{"\n"}
              3. We'll approve and assign to a station{"\n"}
              4. Start earning when others rent your bike!
            </Text>
          </View>

          <ScrollView
            style={{ flex: 1, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingVertical: 24, paddingBottom: 100 }}
          >
            {/* Bike Model Input */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons
                  name="bicycle"
                  size={20}
                  color="#083A4C"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#111827",
                    letterSpacing: -0.2,
                  }}
                >
                  Bike Model
                </Text>
                <Text style={{ color: "#ef4444", marginLeft: 4 }}>*</Text>
              </View>
              <Controller
                control={control}
                name="bikeModel"
                rules={{ 
                  required: "Bike model is required",
                  minLength: { value: 2, message: "Model name must be at least 2 characters" }
                }}
                render={({ field: { onChange, value } }) => (
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: errors.bikeModel
                        ? "#fca5a5"
                        : value
                          ? "#083A4C"
                          : "#e5e7eb",
                      borderRadius: 16,
                      backgroundColor: errors.bikeModel
                        ? "#fef2f2"
                        : "#ffffff",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <TextInput
                      placeholder="e.g., Mountain Bike Pro X, City Cruiser 2024"
                      value={value}
                      onChangeText={onChange}
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 16,
                        fontSize: 16,
                        color: "#111827",
                        fontWeight: "500",
                      }}
                      placeholderTextColor="#9ca3af"
                      returnKeyType="next"
                    />
                  </View>
                )}
              />
              <HelperText
                visible={!!errors.bikeModel}
                message={errors.bikeModel?.message}
                type="error"
              />
            </View>

            {/* Fuel Type Selection */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons
                  name="flash"
                  size={20}
                  color="#083A4C"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#111827",
                    letterSpacing: -0.2,
                  }}
                >
                  Bike Type
                </Text>
                <Text style={{ color: "#ef4444", marginLeft: 4 }}>*</Text>
              </View>
              <Controller
                control={control}
                name="fuelType"
                rules={{ required: "Bike type is required" }}
                render={({ field: { onChange, value } }) => (
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {fuelTypes.map((type) => (
                      <Pressable
                        key={type.value}
                        onPress={() => onChange(type.value)}
                        style={{
                          flex: 1,
                          borderWidth: 2,
                          borderColor:
                            value === type.value ? type.color : "#e5e7eb",
                          borderRadius: 16,
                          paddingVertical: 16,
                          paddingHorizontal: 12,
                          backgroundColor:
                            value === type.value
                              ? `${type.color}10`
                              : "#ffffff",
                          alignItems: "center",
                          shadowColor:
                            value === type.value ? type.color : "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: value === type.value ? 0.15 : 0.05,
                          shadowRadius: 2,
                          elevation: value === type.value ? 3 : 1,
                        }}
                      >
                        <Text style={{ fontSize: 28, marginBottom: 8 }}>
                          {type.icon}
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: value === type.value ? "700" : "600",
                            color: value === type.value ? type.color : "#6b7280",
                          }}
                        >
                          {type.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              />
              <HelperText
                visible={!!errors.fuelType}
                message={errors.fuelType?.message}
                type="error"
              />
            </View>

            {/* Distance Input */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons
                  name="speedometer"
                  size={20}
                  color="#083A4C"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#111827",
                    letterSpacing: -0.2,
                  }}
                >
                  Total Distance Traveled
                </Text>
                <Text style={{ color: "#ef4444", marginLeft: 4 }}>*</Text>
              </View>
              <Controller
                control={control}
                name="distance"
                rules={{ 
                  required: "Distance is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Please enter a valid number"
                  }
                }}
                render={({ field: { onChange, value } }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: errors.distance
                        ? "#fca5a5"
                        : value
                          ? "#083A4C"
                          : "#e5e7eb",
                      borderRadius: 16,
                      backgroundColor: errors.distance
                        ? "#fef2f2"
                        : "#ffffff",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <TextInput
                      placeholder="0"
                      value={value}
                      keyboardType="number-pad"
                      onChangeText={onChange}
                      style={{
                        flex: 1,
                        paddingHorizontal: 18,
                        paddingVertical: 16,
                        fontSize: 16,
                        color: "#111827",
                        fontWeight: "500",
                      }}
                      placeholderTextColor="#9ca3af"
                      returnKeyType="next"
                    />
                    <View
                      style={{
                        backgroundColor: "#083A4C",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 10,
                        marginRight: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: 14,
                        }}
                      >
                        KM
                      </Text>
                    </View>
                  </View>
                )}
              />
              <HelperText
                visible={!!errors.distance}
                message={errors.distance?.message}
                type="error"
              />
            </View>

            {/* Condition Input */}
            <View style={{ marginBottom: 32 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color="#083A4C"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#111827",
                    letterSpacing: -0.2,
                  }}
                >
                  Bike Condition
                </Text>
                <Text style={{ color: "#ef4444", marginLeft: 4 }}>*</Text>
              </View>
              <Controller
                control={control}
                name="condition"
                rules={{
                  required: "Condition is required",
                  min: { value: 1, message: "Condition must be between 1-100%" },
                  max: { value: 100, message: "Condition must be between 1-100%" },
                }}
                render={({ field: { onChange, value } }) => (
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: errors.condition ? "#fca5a5" : "#e5e7eb",
                      borderRadius: 16,
                      backgroundColor: errors.condition ? "#fef2f2" : "#ffffff",
                      padding: 20,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    {/* Condition Value Display */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "baseline",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 36,
                            fontWeight: "700",
                            color: value ? getConditionColor(value) : "#9ca3af",
                          }}
                        >
                          {value || "100"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "600",
                            color: value ? getConditionColor(value) : "#9ca3af",
                            marginLeft: 2,
                          }}
                        >
                          %
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: value
                            ? `${getConditionColor(value)}15`
                            : "#f3f4f6",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: value ? getConditionColor(value) : "#9ca3af",
                            fontWeight: "600",
                          }}
                        >
                          {getConditionLabel(value || "100")}
                        </Text>
                      </View>
                    </View>

                    {/* Condition Input */}
                    <TextInput
                      placeholder="Rate your bike's condition (1-100)"
                      value={value}
                      keyboardType="number-pad"
                      onChangeText={(text) => {
                        const numValue = parseInt(text);
                        if (isNaN(numValue)) {
                          onChange("");
                        } else if (numValue > 100) {
                          onChange("100");
                        } else if (numValue < 1 && text !== "") {
                          onChange("1");
                        } else {
                          onChange(text);
                        }
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontSize: 16,
                        color: "#111827",
                        fontWeight: "500",
                        backgroundColor: "#f9fafb",
                      }}
                      placeholderTextColor="#9ca3af"
                      maxLength={3}
                    />
                  </View>
                )}
              />
              <HelperText
                visible={!!errors.condition}
                message={errors.condition?.message}
                type="error"
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View
            style={{
              padding: 20,
              backgroundColor: "#ffffff",
              borderTopWidth: 1,
              borderTopColor: "#f3f4f6",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Pressable
              onPress={handleSubmit(handleSubmitBike)}
              disabled={isPending}
              style={({ pressed }) => ({
                backgroundColor: isPending 
                  ? "#9ca3af" 
                  : pressed 
                    ? "#065F46" 
                    : "#083A4C",
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: "center",
                shadowColor: "#083A4C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              })}
            >
              {isPending ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                  <Text
                    style={{
                      color: "black",
                      fontWeight: "700",
                      fontSize: 17,
                      letterSpacing: 0.5,
                    }}
                  >
                    SUBMITTING...
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    color: "black",
                    fontWeight: "700",
                    fontSize: 17,
                    letterSpacing: 0.5,
                  }}
                >
                  SUBMIT BIKE FOR REVIEW
                </Text>
              )}
            </Pressable>
            
            <Text
              style={{
                textAlign: "center",
                color: "#6b7280",
                fontSize: 12,
                marginTop: 12,
                lineHeight: 16,
              }}
            >
              By submitting, you agree to share your bike with the RideOn community. 
              You'll earn rewards when others rent your bike!
            </Text>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default AddUserBikes;