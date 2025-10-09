import { saveBikeByUser } from "@/api/bike";
import { addNotification } from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HelperText from "../../HelperText";
import HowItWorks from "./HowItWorks";
import PageHeader from "./PageHeader";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface BikeFormData {
  bikeModel: string;
  fuelType: string;
  distance: string;
  condition: string;
  image?: any;
}

interface ImagePart {
  uri: string;
  name: string;
  type: string;
}

const AddUserBikes = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animation values
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const [fuelTypeScale] = useState({
    Electric: new Animated.Value(1),
    Pedal: new Animated.Value(1),
  });
  const [submitButtonScale] = useState(new Animated.Value(1));
  const checkmarkOpacity = React.useRef(new Animated.Value(0)).current;

  // Image picker states
  const [pickedImage, setPickedImage] = useState<ImagePart | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [imageScale] = useState(new Animated.Value(1));

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

  // Animate progress bar
  useEffect(() => {
    const progress = getProgressPercentage();
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [watchedValues]);

  // Animate checkmark when field is valid
  useEffect(() => {
    const hasValidFields =
      Object.keys(errors).length === 0 &&
      watchedValues.bikeModel &&
      watchedValues.fuelType &&
      watchedValues.distance !== "0" &&
      watchedValues.condition &&
      pickedImage;

    Animated.timing(checkmarkOpacity, {
      toValue: hasValidFields ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [watchedValues, errors, pickedImage]);

  const animateFuelType = (type: string) => {
    // Reset all scales first
    Object.values(fuelTypeScale).forEach((scale) => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    });

    // Animate selected type
    Animated.spring(fuelTypeScale[type as keyof typeof fuelTypeScale], {
      toValue: 1.02,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const animateSubmitPress = (isPressed: boolean) => {
    Animated.spring(submitButtonScale, {
      toValue: isPressed ? 0.98 : 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const checkFirstTimeVisit = async () => {
      try {
        const hasSeenTerms = await AsyncStorage.getItem("hasSeenBikeTerms");

        if (!hasSeenTerms) {
          // Show terms alert
          Alert.alert(
            "Welcome to Bike Sharing! 🚴‍♂️",
            "By adding your bike to RideOn, you agree to our Terms & Conditions and acknowledge that:\n\n• Your bike will be professionally inspected\n• You'll earn revenue when others rent your bike\n• RideOn maintains insurance coverage\n• You can remove your bike anytime\n• Bike placement is at RideOn's discretion",
            [
              {
                text: "I Agree",
                onPress: async () => {
                  await AsyncStorage.setItem("hasSeenBikeTerms", "true");
                },
              },
              {
                text: "Decline",
                onPress: async () => {
                  router.back();
                  await AsyncStorage.setItem("hasSeenBikeTerms", "true");
                  await AsyncStorage.multiRemove(["hasSeenBikeTerms"]);
                },
              },
            ]
          );
        }
      } catch (error) {
        console.log("Error checking terms agreement:", error);
      }
    };

    checkFirstTimeVisit();
  }, []);

  const { mutate: saveBikeMutation, isPending } = useMutation({
    mutationFn: saveBikeByUser,
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-bikes"] });
      console.log("User bike submission successful:", data);

      // Add a notification for the user about bike submission
      await addNotification({
        title: "📝 Bike Submitted for Review",
        message: "Your bike has been submitted successfully! Our team will review it within 24-48 hours. You'll get notified once it's approved.",
        type: 'general',
      });

      Alert.alert(
        "Bike Submitted Successfully! 🚴‍♂️",
        "Your bike has been submitted for review. The RideOn team will approve it and assign it to a station within 24-48 hours. You'll receive a notification once it's ready!",
        [
          {
            text: "Great!",
            onPress: () => {
              reset();
              setPickedImage(null);
              setPreviewUri(null);
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
    if (!pickedImage) {
      Alert.alert(
        "Image Required", 
        "Please upload an image of your bike as proof of condition.", 
        [{ text: "OK" }]
      );
      return;
    }

    const formattedData = {
      ...data,
      image: pickedImage,
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
      gradient: ["#10b981", "#34d399"],
    },
    {
      label: "Pedal",
      value: "Pedal",
      color: "#3b82f6",
      icon: "🚴",
      description: "Classic pedal-powered bike",
      gradient: ["#3b82f6", "#60a5fa"],
    },
  ];

  // Image picker functionality
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to upload bike images.", [
        { text: "OK" }
      ]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const name = asset.fileName || asset.uri.split("/").pop() || `bike_${Date.now()}.jpg`;
      const type = asset.mimeType || (name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");

      const file: ImagePart = { uri: asset.uri, name, type };
      setPickedImage(file);
      setPreviewUri(asset.uri);

      // Animate the image container
      Animated.spring(imageScale, {
        toValue: 1.05,
        friction: 3,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(imageScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const getProgressPercentage = () => {
    const fields = ["bikeModel", "fuelType", "distance", "condition"];
    const filledFields = fields.filter((field) => {
      const value = watchedValues[field as keyof BikeFormData];
      return value && value.trim() !== "" && value !== "0";
    });
    
    // Add image to progress calculation
    const totalFields = fields.length + 1; // +1 for image
    const baseProgress = filledFields.length;
    const imageProgress = pickedImage ? 1 : 0;
    
    return ((baseProgress + imageProgress) / totalFields) * 100;
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

  // Complete form validation including image
  const isFormComplete = isValid && pickedImage;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFB" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        {/* Custom Header - Fixed outside ScrollView */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 15,
            paddingBottom: 25,
            backgroundColor: "#F8FAFB",
          }}
        >
          {/* Header Row */}
          <PageHeader
            title="Add Your Bike"
            progressPercentage={Math.round(getProgressPercentage())}
            onBackPress={() => router.back()}
          />

          <View
            style={{
              height: 4,
              backgroundColor: "#f3f4f6",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                height: "100%",
                backgroundColor: "#083A4C",
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
                borderRadius: 2,
              }}
            />
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
        >
          <HowItWorks />

          {/* Bike Model Input */}
          <View style={{ marginBottom: 24, marginTop: 10 }}>
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
                <Animated.View
                  style={{
                    borderWidth: 2,
                    borderColor: errors.bikeModel
                      ? "#fca5a5"
                      : focusedField === "bikeModel" || value
                        ? "#083A4C"
                        : "#e5e7eb",
                    borderRadius: 16,
                    backgroundColor: errors.bikeModel ? "#fef2f2" : "#ffffff",
                    shadowColor:
                      focusedField === "bikeModel" ? "#083A4C" : "#000",
                    shadowOffset: {
                      width: 0,
                      height: focusedField === "bikeModel" ? 4 : 1,
                    },
                    shadowOpacity: focusedField === "bikeModel" ? 0.15 : 0.05,
                    shadowRadius: focusedField === "bikeModel" ? 8 : 2,
                    elevation: focusedField === "bikeModel" ? 4 : 1,
                    transform: [
                      {
                        scale: focusedField === "bikeModel" ? 1.01 : 1,
                      },
                    ],
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 18,
                      paddingVertical: 4,
                    }}
                  >
                    <Ionicons
                      name="bicycle-outline"
                      size={20}
                      color={
                        value || focusedField === "bikeModel"
                          ? "#083A4C"
                          : "#9ca3af"
                      }
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
                      <Animated.View
                        style={{
                          opacity: checkmarkOpacity,
                          transform: [
                            {
                              scale: checkmarkOpacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                              }),
                            },
                          ],
                        }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10b981"
                        />
                      </Animated.View>
                    )}
                  </View>
                </Animated.View>
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
                Fuel Type
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
                      onPress={() => {
                        onChange(type.value);
                        animateFuelType(type.value);
                      }}
                      style={{ flex: 1 }}
                    >
                      <Animated.View
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
                              : "#fafafa",
                          alignItems: "center",
                          shadowColor:
                            value === type.value ? type.color : "#000",
                          shadowOffset: {
                            width: 0,
                            height: value === type.value ? 4 : 1,
                          },
                          shadowOpacity: value === type.value ? 0.2 : 0.05,
                          shadowRadius: value === type.value ? 8 : 2,
                          elevation: value === type.value ? 4 : 1,
                          transform: [
                            {
                              scale:
                                fuelTypeScale[
                                  type.value as keyof typeof fuelTypeScale
                                ],
                            },
                          ],
                        }}
                      >
                        <Text style={{ fontSize: 24, marginBottom: 8 }}>
                          {type.icon}
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: value === type.value ? "700" : "600",
                            color:
                              value === type.value ? type.color : "#6b7280",
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
                      </Animated.View>
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

          {/* Image Upload Section */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons
                name="camera"
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
                Bike Image (Proof of Condition)
              </Text>
              <Text style={{ color: "#ef4444", marginLeft: 4 }}>*</Text>
            </View>

            <Animated.View
              style={{
                transform: [{ scale: imageScale }],
              }}
            >
              <Pressable
                onPress={handlePickImage}
                style={{
                  borderWidth: 2,
                  borderColor: pickedImage ? "#10b981" : "#e5e7eb",
                  borderRadius: 16,
                  backgroundColor: pickedImage ? "#f0fdf4" : "#fafafa",
                  padding: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 200,
                  shadowColor: pickedImage ? "#10b981" : "#000",
                  shadowOffset: {
                    width: 0,
                    height: pickedImage ? 4 : 1,
                  },
                  shadowOpacity: pickedImage ? 0.2 : 0.05,
                  shadowRadius: pickedImage ? 8 : 2,
                  elevation: pickedImage ? 4 : 1,
                }}
              >
                {previewUri ? (
                  <View style={{ alignItems: "center", width: "100%" }}>
                    <Image
                      source={{ uri: previewUri }}
                      style={{
                        width: "100%",
                        height: 150,
                        borderRadius: 12,
                        marginBottom: 12,
                      }}
                      resizeMode="cover"
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#10b981",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Image Selected
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      Tap to change image
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: "#f3f4f6",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="camera" size={32} color="#9ca3af" />
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      Upload Bike Image
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6b7280",
                        textAlign: "center",
                        lineHeight: 20,
                      }}
                    >
                      Take a clear photo of your bike {"\n"}
                      to show its current condition
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#083A4C",
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 25,
                        marginTop: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        Choose Image
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            </Animated.View>

            <View
              style={{
                backgroundColor: "#EBF4FF",
                padding: 16,
                borderRadius: 12,
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: "#374151",
                  textAlign: "center",
                  lineHeight: 18,
                  fontWeight: "500",
                }}
              >
                📸 Tips: Take a well-lit photo showing the overall condition of your bike. This helps build trust with potential renters and ensures accurate condition assessment.
              </Text>
            </View>
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
                Total Distance Traveled (You Can Not Edit This)
              </Text>
            </View>
            <Controller
              control={control}
              name="distance"
              render={({ field: { value } }) => (
                <Animated.View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#e5e7eb",
                    borderRadius: 16,
                    backgroundColor: "#f9fafb",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View style={{ paddingLeft: 18, paddingVertical: 16 }}>
                    <Ionicons
                      name="speedometer-outline"
                      size={20}
                      color="#9ca3af"
                    />
                  </View>

                  <TextInput
                    value={value?.toString() ?? ""}
                    editable={false} 
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: "#6b7280",
                      fontWeight: "500",
                    }}
                    placeholder="Enter distance traveled"
                    placeholderTextColor="#9ca3af"
                  />

                  <View
                    style={{
                      backgroundColor: "#9ca3af",
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
                </Animated.View>
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
                <Animated.View
                  style={{
                    borderWidth: 2,
                    borderColor: errors.condition
                      ? "#fca5a5"
                      : focusedField === "condition" ||
                          (value && value !== "100")
                        ? getConditionColor(value || "100")
                        : "#e5e7eb",
                    borderRadius: 20,
                    backgroundColor: errors.condition ? "#fef2f2" : "#ffffff",
                    padding: 24,
                    shadowColor:
                      focusedField === "condition"
                        ? getConditionColor(value || "100")
                        : "#000",
                    shadowOffset: {
                      width: 0,
                      height: focusedField === "condition" ? 6 : 2,
                    },
                    shadowOpacity: focusedField === "condition" ? 0.2 : 0.08,
                    shadowRadius: focusedField === "condition" ? 12 : 4,
                    elevation: focusedField === "condition" ? 6 : 2,
                    transform: [
                      {
                        scale: focusedField === "condition" ? 1.02 : 1,
                      },
                    ],
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
                      <Animated.View
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 60,
                          backgroundColor: `${getConditionColor(value || "100")}10`,
                          borderWidth: 6,
                          borderColor: getConditionColor(value || "100"),
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 16,
                          transform: [
                            {
                              scale: focusedField === "condition" ? 1.05 : 1,
                            },
                          ],
                        }}
                      >
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
                      </Animated.View>

                      <Animated.View
                        style={{
                          backgroundColor: getConditionColor(value || "100"),
                          paddingHorizontal: 20,
                          paddingVertical: 8,
                          borderRadius: 25,
                          transform: [
                            {
                              scale: focusedField === "condition" ? 1.05 : 1,
                            },
                          ],
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
                      </Animated.View>
                    </View>
                  </View>

                  {/* Enhanced Condition Input */}
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor:
                        focusedField === "condition"
                          ? getConditionColor(value || "100")
                          : "#e5e7eb",
                      borderRadius: 16,
                      backgroundColor: "#ffffff",
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={
                        focusedField === "condition"
                          ? getConditionColor(value || "100")
                          : "#9ca3af"
                      }
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
                      <Animated.View
                        style={{
                          opacity: checkmarkOpacity,
                          transform: [
                            {
                              scale: checkmarkOpacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                              }),
                            },
                          ],
                        }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={getConditionColor(value)}
                        />
                      </Animated.View>
                    )}
                  </View>

                  {/* Condition Tips */}
                  <Animated.View
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: 16,
                      borderRadius: 12,
                      marginTop: 16,
                      opacity: focusedField === "condition" ? 1 : 0.8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        textAlign: "center",
                        lineHeight: 18,
                      }}
                    >
                      💡 <Text style={{ fontWeight: "600" }}>Tip:</Text> Be
                      honest about your bike's condition. This helps ensure fair
                      pricing and happy customers!
                    </Text>
                  </Animated.View>
                </Animated.View>
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
              backgroundColor: "#ffffff",
              borderRadius: 20,
              marginBottom: 40,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {/* Form Validation Summary */}
            {!isFormComplete && (
              <Animated.View
                style={{
                  backgroundColor: "#FEF3C7",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#F59E0B",
                  opacity: checkmarkOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color="#F59E0B"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#92400E",
                    }}
                  >
                    Please complete all required fields
                    {!pickedImage && " and upload bike image"}
                  </Text>
                </View>
              </Animated.View>
            )}

            <Animated.View
              style={{ transform: [{ scale: submitButtonScale }] }}
            >
              <Pressable
                onPress={handleSubmit(handleSubmitBike)}
                onPressIn={() => animateSubmitPress(true)}
                onPressOut={() => animateSubmitPress(false)}
                disabled={isPending || !isFormComplete}
                style={{
                  backgroundColor:
                    isPending || !isFormComplete ? "#9ca3af" : "#083A4C",
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  opacity: isPending || !isFormComplete ? 0.6 : 1,
                }}
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
            </Animated.View>

            <Animated.View
              style={{
                backgroundColor: "#EBF4FF",
                padding: 16,
                borderRadius: 12,
                marginTop: 16,
                opacity: checkmarkOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#374151",
                  fontSize: 13,
                  lineHeight: 18,
                  fontWeight: "500",
                }}
              >
                🚀 By submitting, you agree to share your bike with the RideOn
                community. {"\n"}
                💰 Start earning rewards when others rent your bike!
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddUserBikes;
