import { saveBikeByUser } from "@/api/bike";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<BikeFormData>({
    defaultValues: {
      bikeModel: "",
      fuelType: "",
      distance: "0",
      condition: "100",
    },
    mode: "onChange",
  });

  const watchedValues = watch();

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
        error?.response?.data?.message ||
          "Failed to submit bike. Please try again.",
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
    { 
      label: "Electric", 
      value: "Electric", 
      color: "#10b981", 
      icon: "⚡",
      description: "Eco-friendly with battery power",
      gradient: ["#10b981", "#34d399"]
    },
    { 
      label: "Pedal", 
      value: "Pedal", 
      color: "#3b82f6", 
      icon: "🚴",
      description: "Classic pedal-powered bike",
      gradient: ["#3b82f6", "#60a5fa"]
    },
  ];

  const getProgressPercentage = () => {
    const fields = ['bikeModel', 'fuelType', 'distance', 'condition'];
    const filledFields = fields.filter(field => {
      const value = watchedValues[field as keyof BikeFormData];
      return value && value.trim() !== '' && value !== '0';
    });
    return (filledFields.length / fields.length) * 100;
  };

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
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 20,
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
            {/* Header Row */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: pressed ? "#f3f4f6" : "#f9fafb",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                })}
              >
                <Ionicons name="arrow-back" size={24} color="#083A4C" />
              </Pressable>

              <View style={{ alignItems: "center", flex: 1, marginHorizontal: 16 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
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

              <View style={{ 
                backgroundColor: "#083A4C", 
                paddingHorizontal: 12, 
                paddingVertical: 6,
                borderRadius: 20,
              }}>
                <Text style={{ 
                  color: "#ffffff", 
                  fontSize: 12, 
                  fontWeight: "700" 
                }}>
                  {Math.round(getProgressPercentage())}%
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={{
              height: 4,
              backgroundColor: "#f3f4f6",
              borderRadius: 2,
              overflow: "hidden",
            }}>
              <Animated.View
                style={{
                  height: "100%",
                  backgroundColor: "#083A4C",
                  width: `${getProgressPercentage()}%`,
                  borderRadius: 2,
                }}
              />
            </View>
          </View>

          {/* Enhanced Process Info Banner */}
          <View
            style={{
              backgroundColor: "#EBF4FF",
              marginHorizontal: 20,
              marginTop: 20,
              padding: 20,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#D1E7FF",
              shadowColor: "#083A4C",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View style={{
                backgroundColor: "#083A4C",
                padding: 8,
                borderRadius: 12,
                marginRight: 12,
              }}>
                <MaterialCommunityIcons
                  name="bike"
                  size={20}
                  color="#ffffff"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#083A4C",
                    letterSpacing: -0.3,
                  }}
                >
                  How it works
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#4B5563",
                    marginTop: 2,
                  }}
                >
                  Simple 4-step process
                </Text>
              </View>
            </View>
            
            <View style={{ gap: 8 }}>
              {[
                { step: "1", text: "Fill out the bike details below", icon: "edit" },
                { step: "2", text: "Submit for review by our team", icon: "send" },
                { step: "3", text: "We'll approve and assign to a station", icon: "check-circle" },
                { step: "4", text: "Start earning when others rent your bike!", icon: "cash" }
              ].map((item, index) => (
                <View key={index} style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 4,
                }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#083A4C",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}>
                    <Text style={{
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: "700",
                    }}>
                      {item.step}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      flex: 1,
                      fontWeight: "500",
                    }}
                  >
                    {item.text}
                  </Text>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={16}
                    color="#6b7280"
                  />
                </View>
              ))}
            </View>
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
                  minLength: {
                    value: 2,
                    message: "Model name must be at least 2 characters",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: errors.bikeModel
                        ? "#fca5a5"
                        : focusedField === "bikeModel" || value
                          ? "#083A4C"
                          : "#e5e7eb",
                      borderRadius: 16,
                      backgroundColor: errors.bikeModel ? "#fef2f2" : "#ffffff",
                      shadowColor: focusedField === "bikeModel" ? "#083A4C" : "#000",
                      shadowOffset: { width: 0, height: focusedField === "bikeModel" ? 4 : 1 },
                      shadowOpacity: focusedField === "bikeModel" ? 0.15 : 0.05,
                      shadowRadius: focusedField === "bikeModel" ? 8 : 2,
                      elevation: focusedField === "bikeModel" ? 4 : 1,
                    }}
                  >
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 18,
                      paddingVertical: 4,
                    }}>
                      <Ionicons
                        name="bicycle-outline"
                        size={20}
                        color={value || focusedField === "bikeModel" ? "#083A4C" : "#9ca3af"}
                        style={{ marginRight: 12 }}
                      />
                      <TextInput
                        placeholder="e.g., Mountain Bike Pro X, City Cruiser 2024"
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setFocusedField("bikeModel")}
                        onBlur={() => setFocusedField(null)}
                        style={{
                          flex: 1,
                          paddingVertical: 16,
                          fontSize: 16,
                          color: "#111827",
                          fontWeight: "500",
                        }}
                        placeholderTextColor="#9ca3af"
                        returnKeyType="next"
                      />
                      {value && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10b981"
                        />
                      )}
                    </View>
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
                        style={({ pressed }) => ({
                          flex: 1,
                          borderWidth: 2,
                          borderColor:
                            value === type.value ? type.color : "#e5e7eb",
                          borderRadius: 20,
                          paddingVertical: 20,
                          paddingHorizontal: 16,
                          backgroundColor:
                            value === type.value
                              ? `${type.color}15`
                              : pressed
                                ? "#f9fafb"
                                : "#ffffff",
                          alignItems: "center",
                          shadowColor:
                            value === type.value ? type.color : "#000",
                          shadowOffset: { width: 0, height: value === type.value ? 4 : 1 },
                          shadowOpacity: value === type.value ? 0.2 : 0.05,
                          shadowRadius: value === type.value ? 8 : 2,
                          elevation: value === type.value ? 6 : 1,
                          transform: [{ scale: pressed ? 0.98 : 1 }],
                        })}
                      >
                        <View style={{
                          backgroundColor: value === type.value ? type.color : "#f3f4f6",
                          padding: 12,
                          borderRadius: 16,
                          marginBottom: 12,
                        }}>
                          <Text style={{ 
                            fontSize: 24,
                            opacity: value === type.value ? 1 : 0.7,
                          }}>
                            {type.icon}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: value === type.value ? "800" : "600",
                            color:
                              value === type.value ? type.color : "#374151",
                            marginBottom: 4,
                          }}
                        >
                          {type.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            textAlign: "center",
                            lineHeight: 16,
                          }}
                        >
                          {type.description}
                        </Text>
                        {value === type.value && (
                          <View style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: type.color,
                            borderRadius: 12,
                            padding: 4,
                          }}>
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#ffffff"
                            />
                          </View>
                        )}
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
                    message: "Please enter a valid number",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: errors.distance
                        ? "#fca5a5"
                        : focusedField === "distance" || value
                          ? "#083A4C"
                          : "#e5e7eb",
                      borderRadius: 16,
                      backgroundColor: errors.distance ? "#fef2f2" : "#ffffff",
                      shadowColor: focusedField === "distance" ? "#083A4C" : "#000",
                      shadowOffset: { width: 0, height: focusedField === "distance" ? 4 : 1 },
                      shadowOpacity: focusedField === "distance" ? 0.15 : 0.05,
                      shadowRadius: focusedField === "distance" ? 8 : 2,
                      elevation: focusedField === "distance" ? 4 : 1,
                    }}
                  >
                    <View style={{
                      paddingLeft: 18,
                      paddingVertical: 16,
                    }}>
                      <Ionicons
                        name="speedometer-outline"
                        size={20}
                        color={value || focusedField === "distance" ? "#083A4C" : "#9ca3af"}
                      />
                    </View>
                    <TextInput
                      placeholder="Enter distance traveled"
                      value={value}
                      keyboardType="number-pad"
                      onChangeText={onChange}
                      onFocus={() => setFocusedField("distance")}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        flex: 1,
                        paddingHorizontal: 12,
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
                        backgroundColor: value || focusedField === "distance" ? "#083A4C" : "#9ca3af",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "700",
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
                  min: {
                    value: 1,
                    message: "Condition must be between 1-100%",
                  },
                  max: {
                    value: 100,
                    message: "Condition must be between 1-100%",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: errors.condition 
                        ? "#fca5a5" 
                        : focusedField === "condition" || (value && value !== "100")
                          ? getConditionColor(value || "100")
                          : "#e5e7eb",
                      borderRadius: 20,
                      backgroundColor: errors.condition ? "#fef2f2" : "#ffffff",
                      padding: 24,
                      shadowColor: focusedField === "condition" ? getConditionColor(value || "100") : "#000",
                      shadowOffset: { width: 0, height: focusedField === "condition" ? 6 : 2 },
                      shadowOpacity: focusedField === "condition" ? 0.2 : 0.08,
                      shadowRadius: focusedField === "condition" ? 12 : 4,
                      elevation: focusedField === "condition" ? 6 : 2,
                    }}
                  >
                    {/* Enhanced Condition Value Display */}
                    <View
                      style={{
                        alignItems: "center",
                        marginBottom: 20,
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <View style={{
                          width: 120,
                          height: 120,
                          borderRadius: 60,
                          backgroundColor: `${getConditionColor(value || "100")}10`,
                          borderWidth: 6,
                          borderColor: getConditionColor(value || "100"),
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 16,
                        }}>
                          <Text
                            style={{
                              fontSize: 32,
                              fontWeight: "800",
                              color: getConditionColor(value || "100"),
                            }}
                          >
                            {value || "100"}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: getConditionColor(value || "100"),
                              marginTop: -4,
                            }}
                          >
                            %
                          </Text>
                        </View>
                        
                        <View
                          style={{
                            backgroundColor: getConditionColor(value || "100"),
                            paddingHorizontal: 20,
                            paddingVertical: 8,
                            borderRadius: 25,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              color: "#ffffff",
                              fontWeight: "700",
                              textAlign: "center",
                            }}
                          >
                            {getConditionLabel(value || "100")}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Enhanced Condition Input */}
                    <View style={{
                      borderWidth: 2,
                      borderColor: focusedField === "condition" 
                        ? getConditionColor(value || "100")
                        : "#e5e7eb",
                      borderRadius: 16,
                      backgroundColor: "#ffffff",
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                    }}>
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={focusedField === "condition" 
                          ? getConditionColor(value || "100")
                          : "#9ca3af"}
                        style={{ marginRight: 12 }}
                      />
                      <TextInput
                        placeholder="Rate your bike's condition (1-100)"
                        value={value}
                        keyboardType="number-pad"
                        onFocus={() => setFocusedField("condition")}
                        onBlur={() => setFocusedField(null)}
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
                          flex: 1,
                          paddingVertical: 16,
                          fontSize: 16,
                          color: "#111827",
                          fontWeight: "500",
                        }}
                        placeholderTextColor="#9ca3af"
                        maxLength={3}
                      />
                      {value && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={getConditionColor(value)}
                        />
                      )}
                    </View>

                    {/* Condition Tips */}
                    <View style={{
                      backgroundColor: "#f8f9fa",
                      padding: 16,
                      borderRadius: 12,
                      marginTop: 16,
                    }}>
                      <Text style={{
                        fontSize: 13,
                        color: "#6b7280",
                        textAlign: "center",
                        lineHeight: 18,
                      }}>
                        💡 <Text style={{ fontWeight: "600" }}>Tip:</Text> Be honest about your bike's condition. This helps ensure fair pricing and happy customers!
                      </Text>
                    </View>
                  </View>
                )}
              />
              <HelperText
                visible={!!errors.condition}
                message={errors.condition?.message}
                type="error"
              />
            </View>
            {/* Enhanced Submit Section */}
            <View
              style={{
                padding: 24,
                backgroundColor: "#083A4C",
                borderTopWidth: 1,
                borderTopColor: "#f3f4f6",
              }}
            >
              {/* Form Validation Summary */}
              {!isValid && (
                <View style={{
                  backgroundColor: "#FEF3C7",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#F59E0B",
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="alert-circle"
                      size={20}
                      color="#F59E0B"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#92400E",
                    }}>
                      Please complete all required fields
                    </Text>
                  </View>
                </View>
              )}

              <Pressable
                onPress={handleSubmit(handleSubmitBike)}
                disabled={isPending || !isValid}
                style={({ pressed }) => ({
                  backgroundColor: isPending || !isValid 
                    ? "#94a3b8" 
                    : pressed 
                      ? "#062a36"
                      : "#083A4C",
                  paddingVertical: 18,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#083A4C",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isPending || !isValid ? 0 : 0.3,
                  shadowRadius: 8,
                  elevation: isPending || !isValid ? 0 : 6,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                {isPending ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator
                      size="small"
                      color="#ffffff"
                      style={{ marginRight: 12 }}
                    />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: 16,
                        letterSpacing: 0.5,
                      }}
                    >
                      SUBMITTING YOUR BIKE...
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="rocket"
                      size={20}
                      color="#ffffff"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: 16,
                        letterSpacing: 0.5,
                      }}
                    >
                      SUBMIT BIKE FOR REVIEW
                    </Text>
                  </View>
                )}
              </Pressable>

              <View style={{
                backgroundColor: "#EBF4FF",
                padding: 16,
                borderRadius: 12,
                marginTop: 16,
              }}>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#374151",
                    fontSize: 13,
                    lineHeight: 18,
                    fontWeight: "500",
                  }}
                >
                  🚀 By submitting, you agree to share your bike with the RideOn community. {"\n"}
                  💰 Start earning rewards when others rent your bike!
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default AddUserBikes;
