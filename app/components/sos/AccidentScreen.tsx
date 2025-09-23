import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const AccidentScreen = () => {
  return (
    <View style={styles.container}>
      <Text>This is the Accident Screen Component</Text>
      {/* Your UI for the accident screen goes here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccidentScreen;