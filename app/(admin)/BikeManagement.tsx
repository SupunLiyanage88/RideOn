import {
  Bike,
  getAllBikes,
  getBikeConditionStats,
  searchBikes,
} from "@/api/bike";
import { images } from "@/constants/images";
import { useDebounce } from "@/utils/useDebounce.utils";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddBtn from "../components/AddBtn";
import AddOrEditBikeDialog from "../components/admin/BikeManagement/AddOrEditBikeDialog";
import BikeCard from "../components/admin/BikeManagement/BikeCard";
import BikeDetailsModal from "../components/admin/BikeManagement/BikeDetailsModal";
import BikeGetCard from "../components/admin/BikeManagement/BikeGetCard";
import Loader from "../components/Loader";
import SearchInput from "../components/SearchBarQuery";

const BikeManagement = () => {
  const [bikeModalVisible, setBikeModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<Bike | null>(null);
  const { data: bikeStatData, isFetching: isBikeStatLoading } = useQuery({
    queryKey: ["bike-stat-data"],
    queryFn: getBikeConditionStats,
  });
  const { data: bikeData, isFetching: isBikeLoading } = useQuery({
    queryKey: ["bike-data"],
    queryFn: getAllBikes,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const {
    data: bikeSearchData,
    refetch: researchBike,
    isFetching: isBikeSearchLoading,
  } = useQuery({
    queryKey: ["bike-data", debouncedQuery],
    queryFn: ({ queryKey }) => searchBikes({ query: queryKey[1] }),
  });

  console.log(bikeSearchData)
  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    setSearchQuery(query);
    try {
      await researchBike();
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

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
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20} // Increased offset
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
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
            <View style={{ flexDirection: "row", marginTop: 5 }}>
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
            <View style={{ marginTop: 10, marginBottom: 10 }}>
              <SearchInput
                placeholder="Search Bikes..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                isSearching={isBikeSearchLoading}
              />
            </View>
            {isBikeSearchLoading && (
              <View style={{ paddingBottom: 24, margin: 8 }}>
                <Loader textStyle={{ fontSize: 20 }} showText={false} />
              </View>
            )}
            {bikeSearchData?.map((bike: Bike) => (
              <BikeGetCard
                key={bike._id}
                bikeId={bike.bikeId}
                fuelType={bike.fuelType}
                bikeModel={bike.bikeModel}
                distance={Number(bike.distance)}
                condition={Number(bike.condition)}
                ownedBy={bike}
                onPress={() => {
                  setSelectedData(bike);
                  setDetailsModalVisible(true);
                }}
              />
            ))}
          </View>
          <BikeDetailsModal
            visible={detailsModalVisible}
            bike={selectedData}
            onClose={() => {
              setDetailsModalVisible(false);
              setSelectedData(null);
            }}
            onEdit={() => {
              setDetailsModalVisible(false);
              setBikeModalVisible(true);
            }}
          />

          <AddOrEditBikeDialog
            visible={bikeModalVisible}
            onClose={() => {
              setBikeModalVisible(false);
              setSelectedData(null);
            }}
            defaultValues={selectedData ?? undefined}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EBEBEB",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
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
