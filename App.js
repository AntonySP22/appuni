// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, SafeAreaView } from 'react-native';
import { DataProvider } from './src/contexts/DataContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/colors';

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar backgroundColor={colors.primary} />
          <AppNavigator />
        </SafeAreaView>
      </NavigationContainer>
    </DataProvider>
  );
}

