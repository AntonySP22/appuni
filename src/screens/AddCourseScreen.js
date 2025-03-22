// src/screens/AddCourseScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useData } from '../contexts/DataContext';
import { colors } from '../constants/colors';

const AddCourseScreen = ({ route, navigation }) => {
  const { addCourse, updateCourse, semesters, addSemester } = useData();
  const editing = route.params?.isEditing || false;
  const existingCourse = route.params?.course || null;
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [uvs, setUvs] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  
  const [newSemester, setNewSemester] = useState(false);
  const [semesterName, setSemesterName] = useState('');
  const [semesterYear, setSemesterYear] = useState(new Date().getFullYear().toString());
  
  // Cargar datos del curso si está en modo edición
  useEffect(() => {
    if (editing && existingCourse) {
      setCode(existingCourse.code);
      setName(existingCourse.name);
      setEnrollment(existingCourse.enrollment);
      setUvs(existingCourse.uvs.toString());
      setSemesterId(existingCourse.semesterId);
      setIsWithdrawn(existingCourse.result === 'withdrawn');
    }
  }, [editing, existingCourse]);
  
  const validateInputs = () => {
    if (!code.trim()) {
      Alert.alert('Error', 'El código de materia es requerido');
      return false;
    }
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de materia es requerido');
      return false;
    }
    if (!enrollment.trim()) {
      Alert.alert('Error', 'La matrícula es requerida');
      return false;
    }
    if (!uvs.trim() || isNaN(Number(uvs)) || Number(uvs) <= 0) {
      Alert.alert('Error', 'Las UVs deben ser un número mayor a 0');
      return false;
    }
    
    if (newSemester) {
      if (!semesterName.trim()) {
        Alert.alert('Error', 'El nombre del ciclo es requerido');
        return false;
      }
      if (!semesterYear.trim() || isNaN(Number(semesterYear))) {
        Alert.alert('Error', 'El año debe ser un número válido');
        return false;
      }
    } else if (!semesterId) {
      Alert.alert('Error', 'Debes seleccionar un ciclo académico');
      return false;
    }
    
    return true;
  };
  
  const handleSaveCourse = () => {
    if (!validateInputs()) return;
    
    let selectedSemesterId = semesterId;
    
    // Si se está creando un nuevo semestre, primero lo añadimos
    if (newSemester) {
      const semester = addSemester({
        name: semesterName,
        year: semesterYear
      });
      selectedSemesterId = semester.id;
    }
    
    const courseData = {
      code,
      name,
      enrollment,
      uvs: Number(uvs),
      semesterId: selectedSemesterId,
      finalGrade: editing ? existingCourse.finalGrade : 0,
      result: isWithdrawn ? 'withdrawn' : (editing ? existingCourse.result : 'pending'),
      activities: editing ? existingCourse.activities : []
    };
    
    if (editing) {
      updateCourse(existingCourse.id, courseData);
      Alert.alert('Éxito', 'Materia actualizada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      addCourse(courseData);
      Alert.alert('Éxito', 'Materia añadida correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {editing ? 'Editar Materia' : 'Agregar Nueva Materia'}
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Código de Materia</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Ej. MAT115"
            maxLength={10}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de Materia</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej. Matemáticas I"
            maxLength={50}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Matrícula</Text>
          <TextInput
            style={styles.input}
            value={enrollment}
            onChangeText={setEnrollment}
            placeholder="Ej. 01"
            maxLength={5}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Unidades Valorativas (UVs)</Text>
          <TextInput
            style={styles.input}
            value={uvs}
            onChangeText={setUvs}
            placeholder="Ej. 4"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.label}>¿Materia retirada?</Text>
          <Switch
            value={isWithdrawn}
            onValueChange={setIsWithdrawn}
            trackColor={{ false: colors.lightGray, true: colors.warning }}
            thumbColor={isWithdrawn ? colors.warning : colors.gray}
          />
        </View>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              !newSemester ? styles.activeToggle : styles.inactiveToggle
            ]}
            onPress={() => setNewSemester(false)}
          >
            <Text style={!newSemester ? styles.activeToggleText : styles.inactiveToggleText}>
              Seleccionar Ciclo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              newSemester ? styles.activeToggle : styles.inactiveToggle
            ]}
            onPress={() => setNewSemester(true)}
          >
            <Text style={newSemester ? styles.activeToggleText : styles.inactiveToggleText}>
              Nuevo Ciclo
            </Text>
          </TouchableOpacity>
        </View>
        
        {newSemester ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Ciclo</Text>
              <TextInput
                style={styles.input}
                value={semesterName}
                onChangeText={setSemesterName}
                placeholder="Ej. Ciclo I"
                maxLength={20}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Año</Text>
              <TextInput
                style={styles.input}
                value={semesterYear}
                onChangeText={setSemesterYear}
                placeholder="Ej. 2025"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ciclo Académico</Text>
            {semesters.length > 0 ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={semesterId}
                  onValueChange={(itemValue) => setSemesterId(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona un ciclo..." value="" />
                  {semesters.map(semester => (
                    <Picker.Item 
                      key={semester.id} 
                      label={`${semester.name} ${semester.year}`} 
                      value={semester.id} 
                    />
                  ))}
                </Picker>
              </View>
            ) : (
              <Text style={styles.noSemestersText}>
                No hay ciclos disponibles. Crea uno nuevo.
              </Text>
            )}
          </View>
        )}
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveCourse}
        >
          <Text style={styles.saveButtonText}>
            {editing ? 'Actualizar Materia' : 'Guardar Materia'}
          </Text>
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
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 16,
    textAlign: 'center',
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
  pickerContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  noSemestersText: {
    color: colors.gray,
    fontStyle: 'italic',
    padding: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  inactiveToggle: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  activeToggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inactiveToggleText: {
    color: colors.darkGray,
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

export default AddCourseScreen;