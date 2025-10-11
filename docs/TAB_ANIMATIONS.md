# Tab Navigation Animations

This guide shows how to use the new smooth animations for your tab navigation using React Native's built-in Animated API.

## What's New

1. **Animated Tab Icons**: Tab icons now have smooth scale, opacity, and bounce animations when switching between tabs
2. **Enhanced Tab Bar**: Added shadow and improved styling for better visual depth
3. **Page Transition Animations**: Smooth fade and slide animations for tab content
4. **Animated Tab Screen Component**: Reusable component for consistent page transitions
5. **Native Performance**: Uses React Native's built-in Animated API for optimal performance without external dependencies

## Components Added

### 1. Enhanced TabIcon (in _layout.tsx)
- **Scale Animation**: Icons slightly scale up when active
- **Bounce Effect**: Subtle upward movement when selected
- **Smooth Transitions**: 200ms timing with spring physics

### 2. AnimatedTabScreen Component
Location: `app/components/AnimatedTabScreen.tsx`

```tsx
import AnimatedTabScreen from '@/app/components/AnimatedTabScreen';

// Usage in your tab screens
export default function YourTabScreen() {
  return (
    <AnimatedTabScreen 
      animationType="combined" // 'fade', 'slide', 'scale', or 'combined'
      duration={250}           // Animation duration in ms
      delay={50}              // Delay before animation starts
    >
      {/* Your screen content */}
    </AnimatedTabScreen>
  );
}
```

### 3. TabIndicator Component (Optional)
Location: `app/components/TabIndicator.tsx`
A sliding indicator that shows the active tab position.

## How to Use

### 1. Tab Icons (Already Applied)
The tab icons in your `_layout.tsx` now automatically have smooth animations. No additional code needed!

### 2. Add Page Transitions to Your Screens

For any tab screen where you want smooth entry animations, wrap your content:

```tsx
// Example: app/(tabs)/search.tsx
import AnimatedTabScreen from '@/app/components/AnimatedTabScreen';

export default function SearchScreen() {
  return (
    <AnimatedTabScreen animationType="combined" delay={0}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Your existing screen content */}
      </SafeAreaView>
    </AnimatedTabScreen>
  );
}
```

### 3. Animation Types

- **`fade`**: Simple opacity transition
- **`slide`**: Slides up from bottom
- **`scale`**: Scales in from 98% to 100%
- **`combined`**: Combines fade, slide, and scale (recommended)

## Configuration Options

### AnimatedTabScreen Props
```tsx
interface AnimatedTabScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;           // Additional styles
  duration?: number;           // Animation duration (default: 250ms)
  delay?: number;             // Start delay (default: 0ms)
  animationType?: 'fade' | 'slide' | 'scale' | 'combined';
}
```

## Performance Notes

- Animations use React Native's built-in Animated API with `useNativeDriver: true`
- All animations run on the native thread for optimal performance
- No external dependencies required - uses React Native core functionality
- Minimal impact on navigation speed
- Smooth 60fps animations on most devices
- Better compatibility across different React Native versions

## Customization

You can customize the animations by:

1. **Adjusting timing**: Change `duration` and `delay` props
2. **Animation curves**: Modify `damping` and `stiffness` in spring configs
3. **Animation distance**: Adjust `translateY` values for different slide distances
4. **Colors**: Update the primary color `#37A77D` in the styles

## Next Steps

1. Apply `AnimatedTabScreen` to your remaining tab screens
2. Test on different devices to ensure smooth performance
3. Consider adding micro-interactions to buttons and cards within screens
4. Experiment with staggered animations for lists and grids

The animations are designed to be subtle and smooth, enhancing the user experience without being distracting.