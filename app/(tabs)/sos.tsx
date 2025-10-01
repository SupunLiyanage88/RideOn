import AccidentScreen from "@/app/components/sos/AccidentScreen";
import IncidentScreen from "@/app/components/sos/IncidentScreen";
import ToggleButton from "@/app/components/toggleButton";
import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SosScreen = () => {
  const [clickedIncident, setClickedIncident] = useState(true);
  const [clickedAccident, setClickedAccident] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        {/* Toggle Button */}
        <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
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

        {/* Screen Content */}
        <View style={{ flex: 1 }}>
          {clickedIncident ? <IncidentScreen /> : <AccidentScreen />}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SosScreen;
