import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BikeCardProps {
  title: string;
  count: number;
  conditionPercentage: string;
  conditionText: string;
  conditionColor: string;
  imageSource: any;
  onPress?: () => void;
}

const BikeCard: React.FC<BikeCardProps> = ({
  title,
  count,
  conditionPercentage,
  conditionText,
  conditionColor,
  onPress,
}) => {
  const titleColor = title.toLowerCase().includes("electric")
    ? "#10B981"
    : title.toLowerCase().includes("pedal")
      ? "#3B82F6"
      : "#333";
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        <View style={styles.statusDot} />
      </View>

      <Text style={styles.count}>{count}</Text>

      <Text style={styles.conditionText}>
        {conditionPercentage} of bikes are in{" "}
        <Text style={[styles.conditionHighlight, { color: conditionColor }]}>
          {conditionText}
        </Text>
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    margin: 8,
    flex: 1, // ✅ makes it flexible in a row
    minWidth: "45%", // ✅ ensures two cards fit side by side
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#777",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  count: {
    fontSize: 50,
    fontWeight: "800",
    color: "#000",
    marginBottom: 6,
  },
  conditionText: {
    fontSize: 13,
    color: "#555",
  },
  conditionHighlight: {
    fontWeight: "600",
  },
  image: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 100,
    height: 80,
  },
});

export default BikeCard;
