import AccidentScreen from "@/app/components/sos/AccidentScreen";
import IncidentScreen from "@/app/components/sos/IncidentScreen";
import ToggleButton from "@/app/components/toggleButton";
import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const sos = () => {
  const [clickedIncident, setClickedIncident] = useState(true);
  console.log(clickedIncident);
  const [clickedAccident, setClickedAccident] = useState(false);
  console.log(clickedAccident);

  return (
    <SafeAreaView>
      <View className="flex=1 h-full px-10 pt-10">
        <View className="justify-center items-center mb-6">
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

        <View
          style={{
            height: clickedIncident ? 700 : 400,
            position: "relative",
          }}
        >
          {clickedIncident ? <IncidentScreen /> : <AccidentScreen />}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default sos;
