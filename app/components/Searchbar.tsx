import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View } from 'react-native';

const Searchbar = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#0B4057", // replace with your secondary color
        alignItems: "center",
        padding: 8,
        borderRadius: 999, // full rounded
      }}
    >
      <Ionicons
        name="search"
        size={24}
        color="white"
        style={{ marginRight: 8 }}
      />
      <TextInput
        placeholder="Search Here"
        style={{ flex: 1, color: "white" }}
        placeholderTextColor="#ccc"
      />
    </View>
  );
};

export default Searchbar