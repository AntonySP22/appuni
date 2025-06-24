import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking } from 'react-native';
import { useData } from '../contexts/DataContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlert } from '../contexts/AlertContext';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';

const ImportExportScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { courses, semesters, loadFullData, updateStats } = useData();
  const { showAlert } = useAlert();

  // Actualiza este método
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
      
      // Nombre del archivo con fecha formateada
      const formattedDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const fileName = `appuni_data_${formattedDate}.json`;
      
      // Guardar en el directorio de caché primero (para Android)
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Escribir contenido al archivo
      await FileSystem.writeAsStringAsync(filePath, jsonData);
      console.log(`Archivo creado temporalmente en: ${filePath}`);
      
      if (Platform.OS === 'android') {
        try {
          // Solicitar al usuario que elija dónde guardar el archivo
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          
          if (permissions.granted) {
            const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              'application/json'
            );
            
            // Leer el archivo temporal
            const fileContent = await FileSystem.readAsStringAsync(filePath);
            
            // Escribir al destino elegido por el usuario
            await FileSystem.StorageAccessFramework.writeAsStringAsync(
              destinationUri,
              fileContent
            );
            
            showAlert({
              title: 'Archivo guardado',
              message: `El archivo ${fileName} ha sido guardado correctamente en la ubicación seleccionada.`,
              type: 'success',
              buttons: [{ text: 'OK' }]
            });
            return;
          } else {
            // El usuario no seleccionó una ubicación
            showAlert({
              title: 'Guardado cancelado',
              message: 'No seleccionaste una ubicación para guardar el archivo.',
              type: 'warning',
              buttons: [{ text: 'OK' }]
            });
            return;
          }
        } catch (e) {
          console.error("Error al usar StorageAccessFramework:", e);
          
          // Si falla, intentamos el método anterior
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath, {
              mimeType: 'application/json',
              dialogTitle: 'Guardar archivo JSON',
              UTI: 'public.json'
            });
            
            showAlert({
              title: 'Archivo disponible',
              message: 'Para guardar el archivo, selecciona "Guardar en" o "Guardar como" en el menú que aparece.',
              type: 'info',
              buttons: [{ text: 'OK' }]
            });
            return;
          }
        }
      } else {
        // Para iOS u otras plataformas, mantener el comportamiento actual
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'application/json',
            dialogTitle: 'Guardar archivo JSON',
            UTI: 'public.json'
          });
        }
      }
    } catch (error) {
      console.error("Error al exportar:", error);
      showAlert({
        title: 'Error',
        message: `No se pudo exportar los datos: ${error.message || 'Error desconocido'}`,
        type: 'error',
        buttons: [{ text: 'OK' }]
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          showAlert({
            title: 'Confirmar importación',
            message: `Se importarán ${importedData.courses.length} materias y ${importedData.semesters.length} ciclos. Esto reemplazará todos tus datos actuales. ¿Estás seguro?`,
            type: 'warning',
            buttons: [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Importar',
                onPress: async () => {
                  const success = await loadFullData(importedData.courses, importedData.semesters);
                  if (success) {
                    showAlert({
                      title: 'Éxito',
                      message: 'Datos importados correctamente. La app se actualizará.',
                      type: 'success',
                      buttons: [{ text: 'OK' }]
                    });
                    // Esperar un momento antes de navegar de vuelta
                    setTimeout(() => navigation.goBack(), 1000);
                  } else {
                    showAlert({
                      title: 'Error',
                      message: 'No se pudieron importar los datos',
                      type: 'error',
                      buttons: [{ text: 'OK' }]
                    });
                  }
                } 
              }
            ]
          });
        } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          showAlert({
            title: 'Error',
            message: 'El archivo no contiene un formato JSON válido',
            type: 'error',
            buttons: [{ text: 'OK' }]
          });
        }
      } else {
        console.log("Selección de archivo cancelada o fallida");
      }
    } catch (error) {
      console.error("Error en importación:", error);
      showAlert({
        title: 'Error',
        message: 'No se pudo importar los datos: ' + error.message,
        type: 'error',
        buttons: [{ text: 'OK' }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllData = () => {
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
              // Limpiar AsyncStorage
              await AsyncStorage.clear();
              
              // Actualizar el contexto con datos vacíos y forzar una actualización completa
              const success = await loadFullData([], []);
              
              if (success) {
                showAlert({
                  title: "Éxito", 
                  message: "Todos los datos han sido eliminados correctamente.",
                  type: "success",
                  buttons: [
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
                });
              } else {
                throw new Error("No se pudo completar el borrado de datos");
              }
            } catch (error) {
              console.error("Error al eliminar datos:", error);
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

  // Función para abrir la configuración de la app
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        { data: 'package:' + Constants.manifest.android.package }
      );
    }
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
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.white} />
          ) : (
            <>
              <Ionicons name="download-outline" size={32} color={colors.white} />
              <Text style={styles.optionText}>Descargar Datos</Text>
              <Text style={styles.optionDescription}>
                Guarda tus datos como archivo JSON (tú eliges dónde)
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.optionButton, { backgroundColor: colors.warning }]} 
          onPress={handleImport}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.white} />
          ) : (
            <>
              <Ionicons name="upload-outline" size={32} color={colors.white} />
              <Text style={styles.optionText}>Importar Datos</Text>
              <Text style={styles.optionDescription}>
                Carga datos desde un archivo previamente exportado
              </Text>
            </>
          )}
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