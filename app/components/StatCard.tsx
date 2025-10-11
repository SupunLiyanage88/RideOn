import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";

type StatCardProps = {
  title: string;
  value: string | number;
  isLoading: boolean;
};

const StatCard = ({ title, value, isLoading }: StatCardProps) => {
  return (
    <TouchableOpacity style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color="#6366F1" style={styles.loader} />
      ) : (
        <Text style={styles.value}>
          {value ?? 0}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    flex: 1,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    minHeight: 120,
  },
  title: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280', // gray-500
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827', // gray-900
    textAlign: 'center',
    marginTop: 4,
  },
  loader: {
    marginTop: 8,
    height: 32,
  },
});

export default StatCard;