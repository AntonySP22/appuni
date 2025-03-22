// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  Switch,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import { useData } from '../contexts/DataContext';

const SettingsScreen = () => {
  const { semesters, courses } = useData();
  // Kept for future implementation but commented out to avoid unused variable warnings
  // const [darkMode, setDarkMode] = useState(false);
  
  const clearAllData = async () => {
    Alert.alert(
      "Eliminar todos los datos",
      "¿Estás seguro de que deseas eliminar todos tus datos? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Éxito", "Todos los datos han sido eliminados. Por favor, reinicia la aplicación.");
            } catch (error) {
              Alert.alert("Error", "Ocurrió un error al intentar eliminar los datos.");
            }
          }
        }
      ]
    );
  };
  
  const exportData = () => {
    Alert.alert(
      "Función no disponible",
      "La exportación de datos estará disponible en futuras versiones."
    );
  };
  
  const importData = () => {
    Alert.alert(
      "Función no disponible",
      "La importación de datos estará disponible en futuras versiones."
    );
  };
  
  // Kept but commented out to avoid unused function warnings
  /*
  const openAbout = () => {
    Alert.alert(
      "Acerca de Uni Control",
      "Versión 1.0.0\n\nUna aplicación para el control académico universitario.\n\nDesarrollada como proyecto educativo."
    );
  };
  
  const openPrivacyPolicy = () => {
    Alert.alert(
      "Política de Privacidad",
      "Esta aplicación almacena todos tus datos únicamente en tu dispositivo. No recopilamos ninguna información personal ni enviamos datos a servidores externos."
    );
  };
  */

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Resumen de Datos</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total de Ciclos:</Text>
            <Text style={styles.statValue}>{semesters.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total de Materias:</Text>
            <Text style={styles.statValue}>{courses.length}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos</Text>
        
        <TouchableOpacity style={styles.optionButton} onPress={exportData}>
          <Ionicons name="download-outline" size={24} color={colors.primary} />
          <Text style={styles.optionText}>Exportar Datos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton} onPress={importData}>
          <Ionicons name="upload-outline" size={24} color={colors.primary} />
          <Text style={styles.optionText}>Importar Datos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.optionButton, styles.dangerButton]} 
          onPress={clearAllData}
        >
          <Ionicons name="trash-outline" size={24} color={colors.danger} />
          <Text style={[styles.optionText, styles.dangerText]}>Eliminar Todos los Datos</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        
        <View style={styles.switchOption}>
          <Text style={styles.optionText}>Modo Oscuro</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;