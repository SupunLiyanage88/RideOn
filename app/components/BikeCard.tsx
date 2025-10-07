import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  imageSource,
  onPress
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.conditionLabel}>{conditionPercentage} of bikes are in</Text>
        <Text style={[styles.conditionText, { color: conditionColor }]}>
          {conditionText}
        </Text>
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.iconContainer}>
        <FontAwesome6 name="angle-right" size={20} color="black" />
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#969696',
  },
  count: {
    fontSize: 56,
    marginTop: 8,
    fontWeight: 'bold',
  },
  conditionLabel: {
    fontSize: 12,
  },
  conditionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  imageContainer: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 208,
    height: 128,
  },
  iconContainer: {
    marginLeft: 'auto',
    alignSelf: 'center',
  },
});

export default BikeCard;