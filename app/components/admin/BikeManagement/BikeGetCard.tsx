import { StyleSheet, TouchableOpacity, View } from "react-native";

interface BikeCardProps {
  title: string;
  count: number;
  conditionPercentage: string;
  conditionText: string;
  conditionColor: string;
  imageSource: any;
  onPress?: () => void;
}

const BikeGetCard: React.FC<BikeCardProps> = ({
  title,
  count,
  conditionPercentage,
  conditionText,
  conditionColor,
  imageSource,
  onPress
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.container}
    >
      <View style={styles.contentContainer}>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  contentContainer: {
    flex: 1,
  }
});

export default BikeGetCard;