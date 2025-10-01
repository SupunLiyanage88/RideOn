import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type StatCardProps = {
  title: string;
  value: string | number;
  isLoading: boolean;
};

const StatCard = ({ title, value, isLoading }: StatCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" style={styles.loader} />
      ) : (
        <Text style={styles.value}>
          {value ?? 0}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D1D5DB', // gray-300
    padding: 20,
    borderRadius: 16,
    flex: 1,
    margin: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  value: {
    fontSize: 24,
    textAlign: 'left',
    alignSelf: 'stretch',
    fontWeight: '600',
    marginTop: 8,
  },
  loader: {
    marginTop: 8,
  },
});

export default StatCard;