import { HowSerious, Incident, IncidentType } from "@/api/incident";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TextInput, View } from "react-native";
import HelperText from "../HelperText";
import ToggleEnumButton from "../ToggleEnumButton";

const IncidentScreen = () => {
   
  const { control, handleSubmit,register, formState: { errors }, } = useForm<Incident>({
    defaultValues: {},
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="pt-6 bg-white rounded-2xl px-4">
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
      <View className="mt-4" />
      <View className="pt-6 bg-white rounded-2xl px-4">
        <View className="mb-6 mt-4">
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
      <View className="mt-4" />

      <View className="pt-6 bg-white rounded-2xl px-4">
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
                    placeholder="Station Name"
                    value={value}
                    onChangeText={onChange}
                    className="flex-1 py-4 text-zinc-900"
                    placeholderTextColor="#9ca3af"
                    {...register("description", {
                      required: {
                        value: true,
                        message: "Station Name is required",
                      },
                    })}
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
      <View className="mb-4" />
      <View className="pt-6 bg-white rounded-2xl px-4">
        <View className="mb-6 mt-4">
          <Text className="font-bold">Incident Level ?</Text>
        </View>
        <View>
         
        </View>
      </View>

    </ScrollView>
  );
};

export default IncidentScreen;
