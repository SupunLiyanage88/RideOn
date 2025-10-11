import AccidentManagement from "@/app/components/admin/EmergencyManagement/AccidentManagement";
import IncidentManagement from "@/app/components/admin/EmergencyManagement/IncidentManagement";
import React, { useState } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToggleButton from "../components/toggleButton";

const EmergencyManagement = () => {
  const [clickedIncident, setClickedIncident] = useState(true);
  const [clickedAccident, setClickedAccident] = useState(false);

  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View style={{flexGrow: 1}}>
        <View style={{
          alignItems: "center",
          justifyContent: "center"
        }}>
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
        <View style={{flex: 1}}>
          {clickedIncident ? <IncidentManagement /> : <AccidentManagement />}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EmergencyManagement;