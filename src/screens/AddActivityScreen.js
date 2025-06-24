// src/screens/AddActivityScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { colors } from '../constants/colors';
import { useAlert } from '../contexts/AlertContext';

const AddActivityScreen = ({ route, navigation }) => {
  const { courseId, courseName } = route.params;
  const { addActivity, courses } = useData();
  const { showAlert } = useAlert();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [percentage, setPercentage] = useState('');
  const [grade, setGrade] = useState('');
  
  const validateInputs = () => {
    if (!name.trim()) {
      showAlert({
        title: 'Error',
        message: 'El nombre de la actividad es requerido',
        type: 'error',
        buttons: [{ text: 'OK' }]
      });
      return false;
    }
    
    if (!percentage.trim() || isNaN(Number(percentage))) {
      showAlert({
        title: 'Error',
        message: 'El porcentaje debe ser un número válido',
        type: 'error',
        buttons: [{ text: 'OK' }]
      });
      return false;
    }
    
    const percentageValue = Number(percentage);
    if (percentageValue <= 0 || percentageValue > 100) {
      showAlert({
        title: 'Error',
        message: 'El porcentaje debe estar entre 0 y 100',
        type: 'error',
        buttons: [{ text: 'OK' }]
      });
      return false;
    }
    
    // Check if total percentage would exceed 100%
    const course = courses.find(c => c.id === courseId);
    if (course && course.activities) {
      const currentTotal = course.activities.reduce((sum, act) => sum + act.percentage, 0);
      const newTotal = currentTotal + percentageValue;
      
      if (newTotal > 100) {
        showAlert({
          title: 'Error',
          message: `El total de porcentajes excedería el 100% (Total actual: ${currentTotal}%, Nuevo total: ${newTotal}%)`,
          type: 'error',
          buttons: [{ text: 'OK' }]
        });
        return false;
      }
    }
    
    if (!grade.trim() || isNaN(Number(grade))) {
      showAlert({
        title: 'Error',
        message: 'La nota debe ser un número válido',
        type: 'error',
        buttons: [{ text: 'OK' }]
      });
      return false;
    }
    
    const gradeValue = Number(grade);
    if (gradeValue < 0 || gradeValue > 10) {
      showAlert({
        title: 'Error',
        message: 'La nota debe estar entre 0 y 10',
        type: 'error',
        buttons: [{ text: 'OK' }]
      });
      return false;
    }
    
    return true;
  };
  
  const handleSaveActivity = () => {
    if (!validateInputs()) return;
    
    const activityData = {
      name,
      description,
      percentage: Number(percentage),
      grade: Number(grade),
    };
    
    addActivity(courseId, activityData);
    showAlert({
      title: "Éxito",
      message: "Actividad agregada correctamente",
      type: "success",
      buttons: [{ text: "OK", onPress: () => navigation.goBack() }]
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.courseTitle}>{courseName}</Text>
        <Text style={styles.formTitle}>Agregar Nueva Actividad</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de la Actividad</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej. Examen Parcial 1"
            maxLength={50}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción o notas adicionales"
            multiline
            numberOfLines={4}
            maxLength={200} />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Porcentaje (%)</Text>
          <TextInput
            style={styles.input}
            value={percentage}
            onChangeText={setPercentage}
            placeholder="Ej. 25"
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nota (0-10)</Text>
          <TextInput
            style={styles.input}
            value={grade}
            onChangeText={setGrade}
            placeholder="Ej. 8.5"
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveActivity}
        >
          <Text style={styles.saveButtonText}>Guardar Actividad</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.darkText,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddActivityScreen;