import { Bike, getAllBikes, getBikeConditionStats } from "@/api/bike";
import { images } from "@/constants/images";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddBtn from "../components/AddBtn";
import AddOrEditBikeDialog from "../components/admin/BikeManagement/AddOrEditBikeDialog";
import BikeCard from "../components/admin/BikeManagement/BikeCard";
import Loader from "../components/Loader";

const BikeManagement = () => {
  const [bikeModalVisible, setBikeModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<Bike | null>(null);
  const { data: bikeStatData, isFetching: isBikeStatLoading } = useQuery({
    queryKey: ["bike-stat-data"],
    queryFn: getBikeConditionStats,
  });

  const { data: bikeData, isFetching: isBikeLoading } = useQuery({
    queryKey: ["bike-data"],
    queryFn: getAllBikes,
  });

  if (isBikeLoading || isBikeStatLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader itemName="Bikes" textStyle={{ fontSize: 20 }} />
      </View>
    );
  }

  type ConditionKey = "good" | "average" | "bad";

  const getConditionDetails = (stats?: {
    good: string;
    average: string;
    bad: string;
  }) => {
    if (!stats) return { percentage: "0%", text: "No Data", color: "#BDC3C7" };

    const conditions: Record<ConditionKey, number> = {
      good: parseFloat(stats.good),
      average: parseFloat(stats.average),
      bad: parseFloat(stats.bad),
    };

    const highestKey = (Object.keys(conditions) as ConditionKey[]).reduce(
      (a, b) => (conditions[a] > conditions[b] ? a : b)
    );

    const colors: Record<ConditionKey, string> = {
      good: "#37A77D",
      average: "#F39C12",
      bad: "#E74C3C",
    };

    const labels: Record<ConditionKey, string> = {
      good: "Good Condition",
      average: "Average Condition",
      bad: "Bad Condition",
    };

    return {
      percentage: stats[highestKey],
      text: labels[highestKey],
      color: colors[highestKey],
    };
  };

  const electricCount =
    bikeData?.filter((b: Bike) => b.fuelType.toLowerCase() === "electric")
      .length || 0;
  const pedalCount =
    bikeData?.filter((b: Bike) => b.fuelType.toLowerCase() === "pedal")
      .length || 0;

  const electricStats = getConditionDetails(bikeStatData?.electric);
  const pedalStats = getConditionDetails(bikeStatData?.pedal);

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.container}>
          <AddBtn
            title="Add New Bike"
            backgroundColor="#083A4C"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
            iconSize={25}
            onPress={() => {
              setBikeModalVisible(true);
            }}
          />
          <BikeCard
            title="Electric Bikes"
            count={electricCount}
            conditionPercentage={electricStats.percentage}
            conditionText={electricStats.text}
            conditionColor={electricStats.color}
            imageSource={images.evbike}
          />
          <BikeCard
            title="Pedal Bikes"
            count={pedalCount}
            conditionPercentage={pedalStats.percentage}
            conditionText={pedalStats.text}
            conditionColor={pedalStats.color}
            imageSource={images.pdbike}
          />
        </View>
        <AddOrEditBikeDialog
          visible={bikeModalVisible}
          onClose={() => {
            setBikeModalVisible(false);
            setSelectedData(null);
          }}
          defaultValues={selectedData ?? undefined}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EBEBEB",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
export default BikeManagement;
