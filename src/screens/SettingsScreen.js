// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Switch,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { useAlert } from '../contexts/AlertContext';

const SettingsScreen = () => {
  const { semesters, courses } = useData();
  const { showAlert } = useAlert();
  // Kept for future implementation but commented out to avoid unused variable warnings
  // const [darkMode, setDarkMode] = useState(false);
  
  const clearAllData = async () => {
    showAlert({
      title: "Eliminar todos los datos",
      message: "¿Estás seguro de que deseas eliminar todos tus datos? Esta acción no se puede deshacer.",
      type: "warning",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              showAlert({
                title: "Éxito",
                message: "Todos los datos han sido eliminados. Por favor, reinicia la aplicación.",
                type: "success",
                buttons: [{ text: "OK" }]
              });
            } catch (error) {
              showAlert({
                title: "Error",
                message: "Ocurrió un error al intentar eliminar los datos.",
                type: "error",
                buttons: [{ text: "OK" }]
              });
            }
          }
        }
      ]
    });
  };
  
  const exportData = () => {
    showAlert({
      title: "Función no disponible",
      message: "La exportación de datos estará disponible en futuras versiones.",
      type: "info",
      buttons: [{ text: "OK" }]
    });
  };
  
  const importData = () => {
    showAlert({
      title: "Función no disponible",
      message: "La importación de datos estará disponible en futuras versiones.",
      type: "info",
      buttons: [{ text: "OK" }]
    });
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginBottom: 12,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: colors.dangerLight,
  },
  dangerText: {
    color: colors.danger,
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginBottom: 12,
    elevation: 2,
  },
});