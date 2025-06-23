// src/screens/AddCourseScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useData } from '../contexts/DataContext';
import { colors } from '../constants/colors';

const AddCourseScreen = ({ route, navigation }) => {
  const { addCourse, updateCourse, semesters, addSemester, stats, courses } = useData();
  const editing = route.params?.isEditing || false;
  const existingCourse = route.params?.course || null;
  
  // ScrollView reference to scroll to active input
  const scrollViewRef = useRef(null);
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [enrollment, setEnrollment] = useState('1'); // Default to '1'
  const [uvs, setUvs] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  
  const [newSemester, setNewSemester] = useState(false);
  const [semesterNumber, setSemesterNumber] = useState(''); 
  const [semesterYear, setSemesterYear] = useState(new Date().getFullYear().toString());
  
  // Reference for all text inputs to help with focus management
  const nameInputRef = useRef(null);
  const uvsInputRef = useRef(null);
  const semesterNumberInputRef = useRef(null);
  const semesterYearInputRef = useRef(null);
  
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

  // Función para calcular el total de UVs ya inscritas en un ciclo
  const calculateTotalUVsInSemester = (targetSemesterId) => {
    return courses
      .filter(course => course.semesterId === targetSemesterId)
      .reduce((total, course) => total + course.uvs, 0);
  };
  
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
    
    // Validar si aún hay UVs disponibles para inscribir
    let selectedSemesterId = semesterId;
    if (newSemester) {
      // Si es un ciclo nuevo, no hay materias previas que contar
      return true;
    }

    // Si estamos editando, no contar las UVs de la materia actual
    let currentSemesterUVs = calculateTotalUVsInSemester(selectedSemesterId);
    if (editing && existingCourse.semesterId === selectedSemesterId) {
      currentSemesterUVs -= existingCourse.uvs;
    }

    // Calcular el total de UVs que tendría el semestre al añadir esta materia
    const newTotalUVs = currentSemesterUVs + Number(uvs);

    // Verificar si excede el límite inscribible
    if (newTotalUVs > stats.inscribibleUVs) {
      Alert.alert(
        'Límite de UVs excedido', 
        `No puedes inscribir esta materia porque excederías el límite de ${stats.inscribibleUVs} UVs permitidas según tu CUM.\n\nUVs ya inscritas: ${currentSemesterUVs}\nUVs de esta materia: ${uvs}\nTotal: ${newTotalUVs}`
      );
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
        name: `Ciclo ${semesterNumber}`, // Format as "Ciclo X"
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

  const handleUvsChange = (text) => {
    // Only allow numeric input
    if (text === '' || /^\d+$/.test(text)) {
      // Si estamos editando un curso existente, permitimos el mismo valor de UVs
      if (editing && existingCourse && text === existingCourse.uvs.toString()) {
        setUvs(text);
        return;
      }
      
      setUvs(text);
    }
  };

  // Function to scroll to input when it becomes focused
  const handleInputFocus = (y) => {
    // Add a small delay to ensure the keyboard is fully open
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: y,
        animated: true
      });
    }, 200);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editing ? 'Editar Materia' : 'Agregar Nueva Materia'}
            </Text>
            
            {/* Current UVs Info */}
            {!newSemester && semesterId && (
              <View style={styles.uvsInfoContainer}>
                <Text style={styles.uvsInfoTitle}>Información de UVs:</Text>
                <View style={styles.uvsInfoRow}>
                  <Text style={styles.uvsInfoLabel}>UVs inscribibles:</Text>
                  <Text style={styles.uvsInfoValue}>{stats.inscribibleUVs}</Text>
                </View>
                <View style={styles.uvsInfoRow}>
                  <Text style={styles.uvsInfoLabel}>UVs ya inscritas:</Text>
                  <Text style={styles.uvsInfoValue}>
                    {calculateTotalUVsInSemester(semesterId) - (editing && existingCourse.semesterId === semesterId ? existingCourse.uvs : 0)}
                  </Text>
                </View>
                <View style={styles.uvsInfoRow}>
                  <Text style={styles.uvsInfoLabel}>UVs disponibles:</Text>
                  <Text style={[
                    styles.uvsInfoValue,
                    styles.uvsAvailable
                  ]}>
                    {stats.inscribibleUVs - (
                      calculateTotalUVsInSemester(semesterId) - 
                      (editing && existingCourse.semesterId === semesterId ? existingCourse.uvs : 0)
                    )}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código de Materia</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Ej. MAT115"
                maxLength={10}
                returnKeyType="next"
                onSubmitEditing={() => nameInputRef.current?.focus()}
                onFocus={() => handleInputFocus(0)}
                blurOnSubmit={false}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre de Materia</Text>
              <TextInput
                ref={nameInputRef}
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej. Matemáticas I"
                maxLength={100}
                returnKeyType="next"
                onSubmitEditing={() => uvsInputRef.current?.focus()}
                onFocus={() => handleInputFocus(70)}
                blurOnSubmit={false}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Matrícula</Text>
              <View style={styles.enrollmentOptions}>
                {['1', '2', '3', '4'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.enrollmentOption,
                      enrollment === option ? styles.selectedEnrollment : null
                    ]}
                    onPress={() => setEnrollment(option)}
                  >
                    <Text 
                      style={enrollment === option ? styles.selectedEnrollmentText : styles.enrollmentText}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Unidades Valorativas (UVs)
              </Text>
              <TextInput
                ref={uvsInputRef}
                style={styles.input}
                value={uvs}
                onChangeText={handleUvsChange}
                placeholder={`Ej. 4`}
                keyboardType="numeric"
                maxLength={2}
                onFocus={() => handleInputFocus(200)}
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
                  <Text style={styles.label}>Ciclo</Text>
                  <TextInput
                    ref={semesterNumberInputRef}
                    style={styles.input}
                    value={semesterNumber}
                    onChangeText={(text) => {
                      if (text === '' || /^\d+$/.test(text)) {
                        setSemesterNumber(text);
                      }
                    }}
                    placeholder="Ej. 1 (se mostrará como 'Ciclo 1')"
                    keyboardType="numeric"
                    maxLength={2}
                    returnKeyType="next"
                    onSubmitEditing={() => semesterYearInputRef.current?.focus()}
                    onFocus={() => handleInputFocus(350)}
                    blurOnSubmit={false}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Año</Text>
                  <TextInput
                    ref={semesterYearInputRef}
                    style={styles.input}
                    value={semesterYear}
                    onChangeText={(text) => {
                      if (text === '' || /^\d+$/.test(text)) {
                        setSemesterYear(text);
                      }
                    }}
                    placeholder="Ej. 2025"
                    keyboardType="numeric"
                    maxLength={4}
                    returnKeyType="done"
                    onFocus={() => handleInputFocus(420)}
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
            
            {/* Extra space at bottom to ensure last field isn't covered by keyboard */}
            <View style={styles.bottomSpace}></View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Add these new styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 30, // Add extra padding at bottom
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
    fontWeight: 'normal', // cambiado de 'bold' a 'normal'
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
  // Enrollment options styles
  enrollmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  enrollmentOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedEnrollment: {
    backgroundColor: colors.primary,
  },
  enrollmentText: {
    fontSize: 16,
    color: colors.darkText,
  },
  selectedEnrollmentText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'normal', // cambiado de 'bold' a 'normal'
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
    fontWeight: 'normal', // cambiado de 'bold' a 'normal'
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
    fontWeight: 'normal', // cambiado de 'bold' a 'normal'
    fontSize: 16,
  },
  bottomSpace: {
    height: 100, // Extra space to ensure bottom fields are visible
  },
  uvsInfoContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  uvsInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 8,
  },
  uvsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  uvsInfoLabel: {
    fontSize: 13,
    color: colors.darkGray,
  },
  uvsInfoValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  uvsAvailable: {
    color: colors.primary,
  },
});

export default AddCourseScreen;