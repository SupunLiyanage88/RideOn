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
    <SafeAreaView className="flex-1">
      {/* <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      > */}
        <View className="flex-grow px-5 pt-5">
          {/* Toggle Button */}
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

          {/* Screen Content */}
          <View className="flex-1">
            {clickedIncident ? <IncidentScreen /> : <AccidentScreen />}
          </View>
        </View>
      {/* </KeyboardAwareScrollView> */}
    </SafeAreaView>
  );
};

export default SosScreen;
