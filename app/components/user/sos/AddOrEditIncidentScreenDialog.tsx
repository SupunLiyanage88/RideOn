import {
  HowSerious,
  Incident,
  IncidentType,
  saveIncident,
  updateIncident,
} from "@/api/incident";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DialogHeader from "../../DialogHeader";
import HelperText from "../../HelperText";
import ToggleEnumButton from "../../ToggleEnumButton";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  defaultValues?: Incident;
};

const IncidentScreenDialog = ({ visible, onClose, defaultValues }: DialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Incident>({
    defaultValues: {
      incidentType: undefined,
      howSerious: undefined,
      description: "",
      date: undefined as any,
      time: "",
    },
  });

  React.useEffect(() => {
    if (!visible) return;

    if (defaultValues) {
      reset({
        _id: defaultValues._id,
        incidentType: defaultValues.incidentType,
        howSerious: defaultValues.howSerious,
        description: defaultValues.description,
        date: new Date(defaultValues.date),
        time: defaultValues.time ? defaultValues.time.substring(0, 5) : "",
      });
    } else {
      reset({
        incidentType: undefined,
        howSerious: undefined,
        description: "",
        date: undefined as any,
        time: "",
      });
    }
  }, [visible, defaultValues, reset]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: saveIncidentMutation, isPending } = useMutation({
    mutationFn: saveIncident,
    onSuccess: () => {
      alert("Incident Save successful");
      reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["incident-data"] });
    },
    onError: (data) => {
      alert("Incident Save failed");
      console.log(data);
    },
  });

  const { mutate: updateIncidentMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateIncident,
    onSuccess: () => {
      alert("Incident Updated Successful");
      reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["incident-data"] });
    },
    onError: (data) => {
      alert("Incident Update failed");
      console.log(data);
    },
  });

  const handleSaveIncident = (data: Incident) => {
    if (defaultValues) {
      const updatedData = { ...data, _id: defaultValues._id };
      if (!updatedData._id) {
        alert("Incident Id Missing");
        return;
      }
      updateIncidentMutation(updatedData);
    } else {
      saveIncidentMutation(data);
      console.log("Incident data to be saved:", data);
    }
  };

  const handleClose = () => {
    reset({
      incidentType: undefined,
      howSerious: undefined,
      description: "",
      date: undefined as any,
      time: "",
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
      }}>
        <View style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: 24,
          width: "90%",
          maxHeight: "90%"
        }}>
          <DialogHeader
            title={defaultValues ? "Edit Incident" : "Add Incident"}
            onClose={handleClose}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Incident Type */}
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 16, marginBottom: 16 }}>
              <Text style={{ fontWeight: "700", marginBottom: 12, marginTop: 16 }}>Incident Type ?</Text>
              <Controller
                control={control}
                name="incidentType"
                render={({ field: { value, onChange } }) => (
                  <ToggleEnumButton options={IncidentType} value={value} onChange={onChange} />
                )}
              />
            </View>

            {/* Incident Level */}
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 16, marginBottom: 16 }}>
              <Text style={{ fontWeight: "700", marginBottom: 12, marginTop: 8 }}>Incident Level ?</Text>
              <Controller
                control={control}
                name="howSerious"
                render={({ field: { value, onChange } }) => (
                  <ToggleEnumButton options={HowSerious} value={value} onChange={onChange} />
                )}
              />
            </View>

            {/* Description */}
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 16, marginBottom: 16 }}>
              <Text style={{ fontWeight: "700", marginBottom: 12, marginTop: 8 }}>Describe Incident</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <View style={{ marginBottom: 16 }}>
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E4E4E7",
                      borderRadius: 16,
                      paddingHorizontal: 16,
                    }}>
                      <TextInput
                        placeholder="Incident"
                        value={value}
                        onChangeText={onChange}
                        style={{ flex: 1, paddingVertical: 16, color: "#111827" }}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <HelperText visible={!!errors.description} message={errors.description?.message} type="error" />
                  </View>
                )}
              />
            </View>

            {/* Incident Date */}
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 16, paddingBottom: 24, marginBottom: 16 }}>
              <Text style={{ fontWeight: "700", marginBottom: 12 }}>Incident Date</Text>
              <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange } }) => (
                  <View>
                    <TouchableOpacity
                      style={{ borderWidth: 1, borderColor: "#E4E4E7", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text>{value ? value.toDateString() : "Select Date"}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={value || new Date()}
                        mode="date"
                        onChange={(_, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) onChange(selectedDate);
                        }}
                      />
                    )}
                  </View>
                )}
              />
            </View>

            {/* Incident Time */}
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 16, paddingBottom: 40, marginBottom: 16 }}>
              <Text style={{ fontWeight: "700", marginBottom: 12, marginTop: 8 }}>Incident Time</Text>
              <Controller
                control={control}
                name="time"
                render={({ field: { value, onChange } }) => {
                  const pickerDate = value
                    ? (() => {
                        const [hours, minutes] = value.split(":").map(Number);
                        const d = new Date();
                        d.setHours(hours || 0, minutes || 0, 0, 0);
                        return d;
                      })()
                    : new Date();
                  const displayTime = value || "Select Time";
                  return (
                    <View>
                      <TouchableOpacity
                        style={{ borderWidth: 1, borderColor: "#E4E4E7", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Text>{displayTime}</Text>
                      </TouchableOpacity>
                      {showTimePicker && (
                        <DateTimePicker
                          value={pickerDate}
                          mode="time"
                          onChange={(_, selectedTime: Date | undefined) => {
                            setShowTimePicker(false);
                            if (selectedTime) {
                              const hours = String(selectedTime.getHours()).padStart(2, "0");
                              const minutes = String(selectedTime.getMinutes()).padStart(2, "0");
                              onChange(`${hours}:${minutes}`);
                            }
                          }}
                        />
                      )}
                    </View>
                  );
                }}
              />
            </View>

            {/* Submit */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 16 }}>
              <Pressable
                onPress={handleSubmit(handleSaveIncident)}
                disabled={isPending || isUpdating}
                style={{
                  width: "100%",
                  borderRadius: 9999,
                  paddingVertical: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#0B4057",
                }}
              >
                {isPending || isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", textAlign: "center" }}>
                    Submit Incident
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default IncidentScreenDialog;
