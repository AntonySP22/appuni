import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useData } from '../contexts/DataContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ImportExportScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { courses, semesters, loadFullData, updateStats } = useData(); // Asegúrate de incluir updateStats aquí

  const handleExport = async () => {
    try {
      setIsLoading(true);
      
      // Preparar datos para exportar
      const exportData = {
        courses,
        semesters,
        version: '1.0',
        exportDate: new Date().toISOString()
      };
      
      // Convertir a JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Nombre del archivo con fecha
      const fileName = `appuni_data_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Guardar archivo temporalmente
      await FileSystem.writeAsStringAsync(filePath, jsonData);
      
      // Compartir archivo con mejores instrucciones
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Guardar archivo de datos',
          UTI: 'public.json'
        });
        
        Alert.alert(
          'Instrucciones',
          '1. El archivo se llama: ' + fileName,
          [{ text: 'Entendido', style: 'default' }]
        );
      } else {
        Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar los datos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función mejorada para importar datos
  const handleImport = async () => {
    try {
      setIsLoading(true);
      
      // Seleccionar archivo
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json'],
      });
      
      // Verificar resultado (nueva API de DocumentPicker)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("Archivo seleccionado:", file.name);
        
        // Leer contenido del archivo
        const fileContent = await FileSystem.readAsStringAsync(file.uri);
        console.log("Contenido leído correctamente");
        
        try {
          // Parsear JSON
          const importedData = JSON.parse(fileContent);
          console.log("JSON parseado correctamente");
          
          // Validar estructura
          if (!importedData.courses || !importedData.semesters) {
            throw new Error('El archivo no contiene los datos esperados');
          }
          
          console.log(`Encontrados: ${importedData.courses.length} cursos y ${importedData.semesters.length} semestres`);
          
          // Confirmar importación
          Alert.alert(
            'Confirmar importación',
            `Se importarán ${importedData.courses.length} materias y ${importedData.semesters.length} ciclos. Esto reemplazará todos tus datos actuales. ¿Estás seguro?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Importar', 
                onPress: async () => {
                  const success = await loadFullData(importedData.courses, importedData.semesters);
                  if (success) {
                    Alert.alert('Éxito', 'Datos importados correctamente. La app se actualizará.');
                    // Esperar un momento antes de navegar de vuelta
                    setTimeout(() => navigation.goBack(), 1000);
                  } else {
                    Alert.alert('Error', 'No se pudieron importar los datos');
                  }
                } 
              }
            ]
          );
        } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          Alert.alert('Error', 'El archivo no contiene un formato JSON válido');
        }
      } else {
        console.log("Selección de archivo cancelada o fallida");
      }
    } catch (error) {
      console.error("Error en importación:", error);
      Alert.alert('Error', 'No se pudo importar los datos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar todos los datos
  const handleDeleteAllData = () => {
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
              // Limpiar AsyncStorage
              await AsyncStorage.clear();
              
              // Actualizar el contexto con datos vacíos y forzar una actualización completa
              const success = await loadFullData([], []);
              
              if (success) {
                Alert.alert(
                  "Éxito", 
                  "Todos los datos han sido eliminados correctamente.",
                  [
                    { 
                      text: "OK",
                      onPress: () => {
                        // Resetear la pila de navegación
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Materias" }],
                        });
                      }
                    }
                  ]
                );
              } else {
                throw new Error("No se pudo completar el borrado de datos");
              }
            } catch (error) {
              console.error("Error al eliminar datos:", error);
              Alert.alert("Error", "Ocurrió un error al intentar eliminar los datos.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Importar/Exportar Datos</Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={handleExport}
          disabled={isLoading}
        >
          <Ionicons name="download-outline" size={32} color={colors.white} />
          <Text style={styles.optionText}>Exportar Datos</Text>
          <Text style={styles.optionDescription}>
            Guarda tus materias, ciclos y actividades en un archivo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.optionButton, { backgroundColor: colors.warning }]} 
          onPress={handleImport}
          disabled={isLoading}
        >
          <Ionicons name="upload-outline" size={32} color={colors.white} />
          <Text style={styles.optionText}>Importar Datos</Text>
          <Text style={styles.optionDescription}>
            Carga datos desde un archivo previamente exportado
          </Text>
        </TouchableOpacity>
        
        {/* Nuevo botón para eliminar datos */}
        <TouchableOpacity 
          style={styles.deleteTextButton}
          onPress={handleDeleteAllData}
        >
          <Text style={styles.deleteButtonText}>Eliminar todos los datos</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.disclaimer}>
        Nota: La importación reemplazará todos los datos actuales. Considera hacer una exportación primero.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginVertical: 20,
  },
  optionButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginVertical: 10,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
  },
  // Nuevo estilo para el botón de texto de eliminación
  deleteTextButton: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    padding: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    color: colors.danger,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  }
});

export default ImportExportScreen;