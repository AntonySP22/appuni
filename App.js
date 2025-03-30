// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, SafeAreaView, Alert } from 'react-native';
import { DataProvider } from './src/contexts/DataContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/colors';
import * as Updates from 'expo-updates';

export default function App() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Actualización disponible", 
            "Se ha descargado una nueva actualización. La app se reiniciará para aplicarla.",
            [{ text: "OK", onPress: () => Updates.reloadAsync() }]
          );
        }
      } catch (error) {
        console.log('Error al verificar actualizaciones:', error);
      }
    }
    
    checkForUpdates();
  }, []);

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

