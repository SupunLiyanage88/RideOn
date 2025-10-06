import { Bike, saveBike } from "@/api/bike";
import queryClient from "@/state/queryClient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import HelperText from "../components/HelperText";

const { width: screenWidth } = Dimensions.get("window");

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  defaultValues?: Bike;
};

const AddOrEditBikeDialog = ({
  visible,
  onClose,
  defaultValues,
}: DialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Bike>({
    defaultValues: defaultValues,
  });

  const { mutate: saveBikeMutation, isPending } = useMutation({
    mutationFn: saveBike,
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["bike"] });
      console.log("Bike Save successful:", data);
      alert("Bike Save successful");
      reset();
      onClose();
    },
    onError: (data) => {
      alert("Bike Save failed");
      console.log(data);
    },
  });

  const handleSaveStation = (data: Bike) => {
    console.log(data);
    saveBikeMutation(data);
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

  const getConditionGradient = (value: string): string => {
    const numValue = parseInt(value || "0");
    if (numValue >= 80) return "#10b981";
    if (numValue >= 60) return "#f59e0b";
    if (numValue >= 40) return "#f97316";
    return "#ef4444";
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: "flex-end" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <View
              style={{
                backgroundColor: "#ffffff",
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                width: "100%",
                maxHeight: "92%",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: -3,
                },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,
                elevation: 10,
              }}
            >
              {/* Custom Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 24,
                  paddingTop: 20,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f3f4f6",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "rgba(11, 64, 87, 0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="bike"
                      size={24}
                      color="#0B4057"
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "700",
                        color: "#111827",
                        letterSpacing: -0.5,
                      }}
                    >
                      {defaultValues ? "Edit Bike" : "Add New Bike"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6b7280",
                        marginTop: 2,
                      }}
                    >
                      Enter bike details below
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: pressed ? "#f3f4f6" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </Pressable>
              </View>

              <ScrollView
                style={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 30 }}
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
                      color="#0B4057"
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
                    rules={{ required: "Bike Model is required" }}
                    render={({ field: { onChange, value } }) => (
                      <View
                        style={{
                          borderWidth: 2,
                          borderColor: errors.bikeModel
                            ? "#fca5a5"
                            : value
                              ? "#0B4057"
                              : "#e5e7eb",
                          borderRadius: 16,
                          backgroundColor: errors.bikeModel
                            ? "#fef2f2"
                            : "#fafafa",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <TextInput
                          placeholder="e.g., Mountain Bike Pro X"
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
                      color="#0B4057"
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
                    rules={{ required: "Fuel Type is required" }}
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
                                  : "#fafafa",
                              alignItems: "center",
                              shadowColor:
                                value === type.value ? type.color : "#000",
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: value === type.value ? 0.15 : 0.05,
                              shadowRadius: 2,
                              elevation: value === type.value ? 3 : 1,
                            }}
                          >
                            <Text style={{ fontSize: 24, marginBottom: 8 }}>
                              {type.icon}
                            </Text>
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight:
                                  value === type.value ? "700" : "600",
                                color:
                                  value === type.value ? type.color : "#6b7280",
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
                      color="#0B4057"
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
                      Distance Traveled
                    </Text>
                    <Text style={{ color: "#ef4444", marginLeft: 4 }}>*</Text>
                  </View>
                  <Controller
                    control={control}
                    name="distance"
                    rules={{ required: "Distance is required" }}
                    render={({ field: { onChange, value } }) => (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 2,
                          borderColor: errors.distance
                            ? "#fca5a5"
                            : value
                              ? "#0B4057"
                              : "#e5e7eb",
                          borderRadius: 16,
                          backgroundColor: errors.distance
                            ? "#fef2f2"
                            : "#fafafa",
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
                            backgroundColor: "#0B4057",
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

                {/* Condition Slider */}
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
                      color="#0B4057"
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
                      Condition
                    </Text>
                    <Text style={{ color: "#ef4444", marginLeft: 4 }}>*</Text>
                  </View>
                  <Controller
                    control={control}
                    name="condition"
                    rules={{
                      required: "Condition is required",
                      min: {
                        value: 0,
                        message: "Condition must be between 0-100%",
                      },
                      max: {
                        value: 100,
                        message: "Condition must be between 0-100%",
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <View
                          style={{
                            borderWidth: 2,
                            borderColor: errors.condition
                              ? "#fca5a5"
                              : "#e5e7eb",
                            borderRadius: 16,
                            backgroundColor: errors.condition
                              ? "#fef2f2"
                              : "#fafafa",
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
                                  color: value
                                    ? getConditionColor(value)
                                    : "#9ca3af",
                                }}
                              >
                                {value || "0"}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 20,
                                  fontWeight: "600",
                                  color: value
                                    ? getConditionColor(value)
                                    : "#9ca3af",
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
                                  color: value
                                    ? getConditionColor(value)
                                    : "#9ca3af",
                                  fontWeight: "600",
                                }}
                              >
                                {value
                                  ? parseInt(value) >= 80
                                    ? "Excellent"
                                    : parseInt(value) >= 60
                                      ? "Good"
                                      : parseInt(value) >= 40
                                        ? "Fair"
                                        : "Poor"
                                  : "Not Set"}
                              </Text>
                            </View>
                          </View>

                          <TextInput
                            placeholder="Enter percentage (0-100)"
                            value={value}
                            keyboardType="number-pad"
                            onChangeText={onChange}
                            style={{
                              borderWidth: 1,
                              borderColor: "#e5e7eb",
                              borderRadius: 12,
                              paddingHorizontal: 16,
                              paddingVertical: 12,
                              fontSize: 16,
                              color: "#111827",
                              backgroundColor: "#fff",
                              marginBottom: 12,
                            }}
                            placeholderTextColor="#9ca3af"
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                          />

                          {/* Progress Bar */}
                          {value && (
                            <View
                              style={{
                                height: 8,
                                backgroundColor: "#e5e7eb",
                                borderRadius: 4,
                                overflow: "hidden",
                              }}
                            >
                              <View
                                style={{
                                  width: `${Math.min(100, parseInt(value || "0"))}%`,
                                  height: "100%",
                                  borderRadius: 4,
                                  backgroundColor: getConditionGradient(value),
                                }}
                              />
                            </View>
                          )}
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

                {/* Action Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "flex-start",                    
                  }}
                >
                  <Pressable
                    onPress={onClose}
                    style={({ pressed }) => ({
                      flex: 1,
                      borderRadius: 16,
                      paddingVertical: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f3f4f6",
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      style={{
                        backgroundColor: "#D9D9D9",
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: "black",
                          fontSize: 16,
                          fontWeight: "700",
                          letterSpacing: 0.3,
                        }}
                      >
                        Cancel
                      </Text>
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSubmit(handleSaveStation)}
                    disabled={isPending}
                    style={({ pressed }) => ({
                      flex: 2,
                      borderRadius: 16,
                      backgroundColor: "#0B4057",
                      opacity: isPending ? 0.7 : pressed ? 0.9 : 1,
                      shadowColor: "#0B4057",
                      shadowOffset: {
                        width: 0,
                        height: 4,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 5,
                      elevation: 8,
                    })}
                  >
                    <View
                      style={{
                        backgroundColor: "#083A4C",
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        borderRadius: 16,
                      }}
                    >
                      {isPending ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="white"
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={{
                              color: "white",
                              fontSize: 16,
                              fontWeight: "700",
                              letterSpacing: 0.3,
                            }}
                          >
                            {defaultValues ? "Update Bike" : "Add Bike"}
                          </Text>
                        </>
                      )}
                    </View>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddOrEditBikeDialog;
