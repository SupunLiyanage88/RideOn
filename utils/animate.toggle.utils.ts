import { Dimensions } from "react-native";
import { interpolate, SharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

const screenWidth = Dimensions.get("screen").width;

/**
 * Returns animated style for sliding screens
 * @param offset SharedValue (0 = btn1, 1 = btn2)
 * @param direction "btn1" | "btn2"
 */
export const useSlideAnimation = (offset: SharedValue<number>, direction: "btn1" | "btn2") => {
  return useAnimatedStyle(() => {
    const translateX =
      direction === "btn1"
        ? interpolate(offset.value, [0, 1], [0, -screenWidth])
        : interpolate(offset.value, [0, 1], [screenWidth, 0]);

    const opacity =
      direction === "btn1"
        ? interpolate(offset.value, [0, 0.5, 1], [1, 0, 0])
        : interpolate(offset.value, [0, 0.5, 1], [0, 0, 1]);

    return {
      width: "100%",
      transform: [{ translateX }],
      opacity,
      position: "absolute",
    };
  });
};

/**
 * Animate offset value
 * @param offset SharedValue
 * @param login boolean - true for login, false for register
 * @param duration animation duration
 */
export const toggleSlide = (offset: SharedValue<number>, login: boolean, duration = 300) => {
  offset.value = withTiming(login ? 0 : 1, { duration });
};

/**
 * Animate dynamic height for bottom card
 * @param offset SharedValue
 * @param loginHeight number
 * @param registerHeight number
 */
export const useDynamicHeight = (
  offset: SharedValue<number>,
  loginHeight: number,
  registerHeight: number
) => {
  return useAnimatedStyle(() => {
    const height = interpolate(offset.value, [0, 1], [loginHeight, registerHeight]);
    return {
      height,
    };
  });
};
