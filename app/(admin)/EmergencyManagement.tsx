import AccidentManagement from "@/app/(admin)/AccidentManagement";
import IncidentManagement from "@/app/(admin)/IncidentManagement";
import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToggleButton from "../components/toggleButton";

const EmergencyManagement = () => {
  const [clickedIncident, setClickedIncident] = useState(true);
  const [clickedAccident, setClickedAccident] = useState(false);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-grow px-1 ">
        <View className="items-center justify-center ">
          <ToggleButton
            leftLabel="Incident"
            rightLabel="Accident"
            click01={clickedIncident}
            click02={clickedAccident}
            onToggle={(left, right) => {
              setClickedIncident(left);
              setClickedAccident(right);
            }}
          />
        </View>
        <View className="flex-1">
          {clickedIncident ? <IncidentManagement /> : <AccidentManagement />}
        </View>
      </View>
    </SafeAreaView>
  );
};
export default EmergencyManagement;
