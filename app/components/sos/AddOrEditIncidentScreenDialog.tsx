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
import DialogHeader from "../DialogHeader";
import HelperText from "../HelperText";
import ToggleEnumButton from "../ToggleEnumButton";
type DialogProps = {
  visible: boolean;
  onClose: () => void;
  defaultValues?: Incident;
};
const IncidentScreenDialog = ({
  visible,
  onClose,
  defaultValues,
}: DialogProps) => {
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
      queryClient.invalidateQueries({
        queryKey: ["incident-data"],
      });
    },
    onError: (data) => {
      alert("Incident Save failed");
      console.log(data);
    },
  });

  const { mutate: updateIncidentMutation, isPending: isUpdating } = useMutation(
    {
      mutationFn: updateIncident,
      onSuccess: () => {
        alert("Incident Updated Successful");
        reset();
        onClose();
        queryClient.invalidateQueries({
          queryKey: ["incident-data"],
        });
      },
      onError: (data) => {
        alert("Incident Update failed");
        console.log(data);
      },
    }
  );

  const handleSaveIncident = (data: Incident) => {
    console.log(data);
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
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 w-[90%] max-h-[90%]">
          <DialogHeader
            title={defaultValues ? "Edit Incident" : "Add Incident"}
            onClose={handleClose}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Incident Type */}
            <View className=" bg-white rounded-2xl px-4">
              <View className="mb-6 mt-4">
                <Text className="font-bold">Incident Type ?</Text>
              </View>
              <View>
                <Controller
                  control={control}
                  name="incidentType"
                  render={({ field: { value, onChange } }) => (
                    <ToggleEnumButton
                      options={IncidentType}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </View>
            </View>

            {/* Incident Level */}
            <View className=" bg-white rounded-2xl px-4">
              <View className="mb-6 mt-2">
                <Text className="font-bold">Incident Level ?</Text>
              </View>
              <View>
                <Controller
                  control={control}
                  name="howSerious"
                  render={({ field: { value, onChange } }) => (
                    <ToggleEnumButton
                      options={HowSerious}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </View>
            </View>

            {/* Description */}
            <View className=" bg-white rounded-2xl px-4">
              <View className="mb-6 mt-2">
                <Text className="font-bold">Describe Incident</Text>
              </View>
              <View>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <View className="mb-6">
                      <View className="flex-row items-center rounded-xl border border-zinc-200 px-4">
                        <TextInput
                          placeholder="Incident"
                          value={value}
                          onChangeText={onChange}
                          className="flex-1 py-4 text-zinc-900"
                          placeholderTextColor="#9ca3af"
                          // {...register("description", {
                          //   required: {
                          //     value: true,
                          //     message: "Incident is required",
                          //   },
                          // })}
                        />
                      </View>
                      <HelperText
                        visible={!!errors.description}
                        message={errors.description?.message}
                        type="error"
                      />
                    </View>
                  )}
                />
              </View>
            </View>

            {/* Incident Date */}
            <View className=" bg-white rounded-2xl px-4 pb-6">
              <View className="mb-6 ">
                <Text className="font-bold">Incident Date</Text>
              </View>
              <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange } }) => (
                  <View>
                    <TouchableOpacity
                      className="border rounded-xl px-4 py-3"
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text>
                        {value ? value.toDateString() : "Select Date"}
                      </Text>
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
            <View className=" bg-white rounded-2xl px-4 pb-10">
              <View className="mb-6 mt-2">
                <Text className="font-bold">Incident Time</Text>
              </View>
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
                        className="border rounded-xl px-4 py-3"
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
                              const hours = String(
                                selectedTime.getHours()
                              ).padStart(2, "0");
                              const minutes = String(
                                selectedTime.getMinutes()
                              ).padStart(2, "0");
                              const timeString = `${hours}:${minutes}`; // always "HH:mm"
                              onChange(timeString);
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
            <View className="flex-row justify-center">
              <Pressable
                onPress={handleSubmit(handleSaveIncident)}
                disabled={isPending}
                className="w-full rounded-full py-4 items-center justify-center bg-[#0B4057]"
              >
                {isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold">
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
//test
export default IncidentScreenDialog;

