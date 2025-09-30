import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image, Text, TouchableOpacity, View } from "react-native";

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
      className="flex-row bg-white m-2 py-5 px-5 rounded-3xl"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-[#969696]">{title}</Text>
        <Text className="text-7xl mt-2 font-bold">{count}</Text>
        <Text>{conditionPercentage} of bikes are in</Text>
        <Text className="font-semibold" style={{ color: conditionColor }}>
          {conditionText}
        </Text>
      </View>
      <View className="ml-2 items-center justify-center">
        <Image
          source={imageSource}
          className="w-52 h-32"
          resizeMode="contain"
        />
      </View>
      <View className="ml-auto self-center">
        <FontAwesome6 name="angle-right" size={20} color="black" />
      </View>
    </TouchableOpacity>
  );
};

export default BikeCard;