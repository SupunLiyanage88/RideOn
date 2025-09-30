import {
    ActivityIndicator,
    ActivityIndicatorProps,
    Text,
    View,
} from "react-native";

interface LoaderProps {
  showSubtitle?: boolean;
  itemName?: string;
  size?: ActivityIndicatorProps["size"];
  containerClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

const Loader = ({
  showSubtitle = true,
  itemName = "",
  size = "large",
  containerClassName = "",
  textClassName = "",
  showText = true,
}: LoaderProps) => {
  return (
    <View
      className={`flex-1 justify-center items-center bg-white ${containerClassName}`}
    >
      <View className="items-center">
        <ActivityIndicator size={size} color="#37A77D" />

        {/* Only render text if showText is true */}
        {showText ? (
          <>
            <Text
              className={`mt-3 text-[#083A4C] text-base font-semibold ${textClassName}`}
            >
              Loading {itemName}...
            </Text>
            {showSubtitle && (
              <Text className="mt-1 text-[#083A4C]/60 text-sm">
                Please wait a moment
              </Text>
            )}
          </>
        ) : null}
      </View>
    </View>
  );
};

export default Loader;

//itemName="user profile"
//showSubtitle={false}
//textClassName="text-xl"
//showText={false}
