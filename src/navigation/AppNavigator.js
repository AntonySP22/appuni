// src/navigation/AppNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from 'react-native';

import HomeScreen from "../screens/HomeScreen";
import CourseDetailScreen from "../screens/CourseDetailScreen";
import AddCourseScreen from "../screens/AddCourseScreen";
import AddActivityScreen from "../screens/AddActivityScreen";
import ImportExportScreen from "../screens/ImportExportScreen";
import { colors } from "../constants/colors";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Materias" 
        component={HomeScreen} 
        options={({ navigation }) => ({
          title: "Mis Materias",
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('ImportExport')}
            >
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
          )
        })}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen} 
        options={({ route }) => ({ 
          title: route.params?.courseName || 'Detalle de Materia'
        })}
      />
      <Stack.Screen 
        name="AddCourse" 
        component={AddCourseScreen} 
        options={{ title: 'Agregar Materia' }}
      />
      <Stack.Screen 
        name="AddActivity" 
        component={AddActivityScreen} 
        options={{ title: 'Agregar Actividad' }}
      />
      <Stack.Screen 
        name="ImportExport" 
        component={ImportExportScreen} 
        options={{ title: 'Importar/Exportar Datos' }}
      />
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? "school" : "school-outline";
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: { paddingBottom: 5 },
        tabBarStyle: { height: 60 },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ title: 'Materias' }}
      />
    </Tab.Navigator>
  );
}
