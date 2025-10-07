import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface QuickActionCardProps {
  icon: string;
  title: string;
  color: string;
  onPress: () => void;
}

const QuickActionCard = ({ icon, title, color, onPress }: QuickActionCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: color,
          shadowColor: color,
        }
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 120,
    justifyContent: "center",
  },
  icon: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    letterSpacing: -0.2
  }
});

export default QuickActionCard;