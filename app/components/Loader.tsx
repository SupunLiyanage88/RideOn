import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface LoaderProps {
  showSubtitle?: boolean;
  itemName?: string;
  size?: ActivityIndicatorProps["size"];
  containerStyle?: any;
  textStyle?: any;
  showText?: boolean;
}

const Loader = ({
  showSubtitle = true,
  itemName = "",
  size = "large",
  containerStyle = {},
  textStyle = {},
  showText = true,
}: LoaderProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color="#37A77D" />

        {/* Only render text if showText is true */}
        {showText ? (
          <>
            <Text style={[styles.mainText, textStyle]}>
              Loading {itemName}...
            </Text>
            {showSubtitle && (
              <Text style={styles.subtitleText}>
                Please wait a moment
              </Text>
            )}
          </>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  mainText: {
    marginTop: 12,
    color: '#083A4C',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitleText: {
    marginTop: 4,
    color: 'rgba(8, 58, 76, 0.6)',
    fontSize: 14,
  },
});

export default Loader;