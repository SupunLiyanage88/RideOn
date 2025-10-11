import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface AnimatedTabScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  duration?: number;
  delay?: number;
  animationType?: 'fade' | 'slide' | 'scale' | 'combined';
}

const AnimatedTabScreen: React.FC<AnimatedTabScreenProps> = ({
  children,
  style,
  duration = 250,
  delay = 0,
  animationType = 'combined',
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    const animations = [];

    // Opacity animation
    animations.push(
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      })
    );

    // Slide animation
    if (animationType === 'slide' || animationType === 'combined') {
      animations.push(
        Animated.spring(translateY, {
          toValue: 0,
          delay,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        })
      );
    }

    // Scale animation
    if (animationType === 'scale' || animationType === 'combined') {
      animations.push(
        Animated.spring(scale, {
          toValue: 1,
          delay,
          tension: 140,
          friction: 9,
          useNativeDriver: true,
        })
      );
    }

    // Start all animations in parallel
    Animated.parallel(animations).start();
  }, [delay, duration, animationType, opacity, translateY, scale]);

  // Build transform array based on animation type
  const getTransform = () => {
    const transform = [];
    
    if (animationType === 'slide' || animationType === 'combined') {
      transform.push({ translateY });
    }
    
    if (animationType === 'scale' || animationType === 'combined') {
      transform.push({ scale });
    }

    return transform;
  };

  return (
    <Animated.View
      style={[
        { flex: 1 },
        style,
        {
          opacity,
          transform: getTransform(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedTabScreen;