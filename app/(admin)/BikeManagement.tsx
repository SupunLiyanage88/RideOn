import { Bike, getAllBikes, getBikeConditionStats } from "@/api/bike";
import { images } from "@/constants/images";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import BikeCard from "../components/BikeCard";
import Loader from "../components/Loader";

const BikeManagement = () => {
  const { data: bikeStatData, isFetching: isBikeStatLoading } = useQuery({
    queryKey: ["bike-stat-data"],
    queryFn: getBikeConditionStats,
  });

  const { data: bikeData, isFetching: isBikeLoading } = useQuery({
    queryKey: ["bike-data"],
    queryFn: getAllBikes,
  });

  const AddBtn = () => {
    return (
      <TouchableOpacity>
        <View>
          <Text>Add btn</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isBikeLoading || isBikeStatLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Loader itemName="Bikes" textClassName="text-xl"/>
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
    <ScrollView className="h-full">
      <View className="flex justify-center px-5 mt-3">
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
      <AddBtn />
    </ScrollView>
  );
};

export default BikeManagement;
