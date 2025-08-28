import { router } from 'expo-router'
import React from 'react'
import { Button, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const registerScreen = () => {
  return (
    <SafeAreaView>
    <View>
      <Text>registerScreen</Text>
      <Button title='Register' onPress={() => router.push("/(auth)/loginScreen")} />
    </View>
    </SafeAreaView>
  )
}

export default registerScreen