// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  Switch // Add this import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { useAlert } from '../contexts/AlertContext';
import CourseCard from '../components/CourseCard';
import StatsSummary from '../components/StatsSummary';
import { colors } from '../constants/colors';

const HomeScreen = ({ navigation }) => {
  const { 
    courses, 
    semesters, 
    stats, 
    loading, 
    deleteSemester, 
    updateSemester,
    deleteCourse, // Add this
    updateCourse  // Add this
  } = useData();
  const { showAlert } = useAlert();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [editSemesterNumber, setEditSemesterNumber] = useState('');
  const [editSemesterYear, setEditSemesterYear] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState(null);
  const [deleteAssociatedCourses, setDeleteAssociatedCourses] = useState(false);

  useEffect(() => {
    // Primero filtrar por semestre
    let semesterFiltered = selectedSemester === 'all' 
      ? courses 
      : courses.filter(course => course.semesterId === selectedSemester);
    
    // Luego filtrar por estado (aprobada, reprobada, etc)
    if (filterType === 'all') {
      setFilteredCourses(semesterFiltered);
    } else {
      setFilteredCourses(semesterFiltered.filter(course => course.result === filterType));
    }
  }, [courses, filterType, selectedSemester]);

  // Mejora la función para manejar mejor la ausencia del número de ciclo
  const getSemesterName = (semesterId) => {
    if (semesterId === 'all') return 'Todos los ciclos';
    
    const semester = semesters.find(sem => sem.id === semesterId);
    if (!semester) return 'Ciclo desconocido';
    
    // Intenta obtener el número del ciclo de diferentes propiedades
    let cycleNumber;
    
    // Opción 1: Usa la propiedad number o semester si existe
    if (semester.number !== undefined) {
      cycleNumber = semester.number;
    } else if (semester.semester !== undefined) {
      cycleNumber = semester.semester;
    } 
    // Opción 2: Intenta extraer el número del nombre (si existe)
    else if (semester.name && /\d+/.test(semester.name)) {
      const match = semester.name.match(/\d+/);
      if (match) cycleNumber = match[0];
    }
    // Opción 3: Usa el índice en el array + 1 como número de ciclo
    else {
      const index = semesters.findIndex(sem => sem.id === semesterId);
      cycleNumber = index >= 0 ? (index + 1) : '?';
    }
    
    return `Ciclo ${cycleNumber} ${semester.year || ''}`;
  };

  const handleEditSemester = (semester) => {
    setEditingSemester(semester);
    setEditSemesterNumber(semester.number ? semester.number.toString() : '');
    setEditSemesterYear(semester.year ? semester.year.toString() : '');
    setShowEditModal(true);
  };

  const handleDeleteSemester = (semesterId) => {
    // Check if there are courses associated with this semester
    const associatedCourses = courses.filter(course => course.semesterId === semesterId);
    const semester = semesters.find(s => s.id === semesterId);
    
    if (associatedCourses.length > 0) {
      // Set the semester for deletion and show custom modal
      setSemesterToDelete(semesterId);
      setDeleteAssociatedCourses(false); // Default to not deleting courses
      setShowDeleteModal(true);
    } else {
      // If no associated courses, confirm deletion with regular Alert
      Alert.alert(
        "Eliminar Ciclo",
        "¿Estás seguro de que deseas eliminar este ciclo?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Eliminar", 
            style: "destructive",
            onPress: () => {
              deleteSemester(semesterId);
              if (selectedSemester === semesterId) {
                setSelectedSemester('all');
              }
            }
          }
        ]
      );
    }
  };

  const confirmDeleteSemester = () => {
    if (!semesterToDelete) return;
    
    if (deleteAssociatedCourses) {
      // Delete all courses associated with this semester
      const associatedCourses = courses.filter(course => course.semesterId === semesterToDelete);
      associatedCourses.forEach(course => {
        deleteCourse(course.id);
      });
    } else {
      // Update all courses to have no semesterId
      updateCoursesWithNoSemester(semesterToDelete);
    }
    
    // Delete the semester
    deleteSemester(semesterToDelete);
    
    // Update selected semester if needed
    if (selectedSemester === semesterToDelete) {
      setSelectedSemester('all');
    }
    
    // Close the modal
    setShowDeleteModal(false);
    setSemesterToDelete(null);
  };
  
  const updateCoursesWithNoSemester = (semesterId) => {
    // Get all courses for this semester
    const semesterCourses = courses.filter(course => course.semesterId === semesterId);
    
    // Update each course to have no semester
    semesterCourses.forEach(course => {
      updateCourse(course.id, { semesterId: '' });
    });
  };

  const saveEditedSemester = () => {
    if (!editingSemester) return;
    
    const number = parseInt(editSemesterNumber);
    const year = parseInt(editSemesterYear);
    
    if (isNaN(number)) {
      showAlert({
        title: "Error",
        message: "El número de ciclo debe ser un número válido",
        type: "error",
        buttons: [{ text: "OK" }]
      });
      return;
    }
    
    if (isNaN(year)) {
      showAlert({
        title: "Error",
        message: "El año debe ser un número válido",
        type: "error",
        buttons: [{ text: "OK" }]
      });
      return;
    }
    
    updateSemester(editingSemester.id, {
      number: number,
      year: year,
      name: `Ciclo ${number}`
    });
    
    setShowEditModal(false);
    setEditingSemester(null);
    
    showAlert({
      title: "Éxito",
      message: "Ciclo actualizado correctamente",
      type: "success",
      buttons: [{ text: "OK" }]
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatsSummary stats={stats} />
      
      {/* Selector de ciclo */}
      <TouchableOpacity 
        style={styles.semesterSelector}
        onPress={() => setShowSemesterModal(true)}
      >
        <Text style={styles.semesterLabel}>
          {getSemesterName(selectedSemester)}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.darkGray} />
      </TouchableOpacity>
      
      {/* Modal para seleccionar ciclo */}
      <Modal
        visible={showSemesterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSemesterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSemesterModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccionar Ciclo</Text>
              
              <ScrollView>
                <TouchableOpacity 
                  style={[
                    styles.semesterOption, 
                    selectedSemester === 'all' && styles.activeSemesterOption
                  ]} 
                  onPress={() => {
                    setSelectedSemester('all');
                    setShowSemesterModal(false);
                  }}
                >
                  <Text style={selectedSemester === 'all' ? styles.activeSemesterText : styles.semesterText}>
                    Todos los ciclos
                  </Text>
                  {selectedSemester === 'all' && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
                
                {semesters.map((semester, index) => {
                  // Calcula el número de ciclo con la misma lógica
                  let cycleNumber;
                  if (semester.number !== undefined) {
                    cycleNumber = semester.number;
                  } else if (semester.semester !== undefined) {
                    cycleNumber = semester.semester;
                  } else if (semester.name && /\d+/.test(semester.name)) {
                    const match = semester.name.match(/\d+/);
                    if (match) cycleNumber = match[0];
                  } else {
                    cycleNumber = index + 1; // Usa el índice como fallback
                  }
                  
                  return (
                    <View key={semester.id} style={styles.semesterRow}>
                      <TouchableOpacity 
                        style={[
                          styles.semesterOption, 
                          selectedSemester === semester.id && styles.activeSemesterOption,
                          { flex: 1 }
                        ]} 
                        onPress={() => {
                          setSelectedSemester(semester.id);
                          setShowSemesterModal(false);
                        }}
                      >
                        <Text style={selectedSemester === semester.id ? styles.activeSemesterText : styles.semesterText}>
                          Ciclo {cycleNumber} {semester.year || ''}
                        </Text>
                        {selectedSemester === semester.id && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                      
                      <View style={styles.semesterActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditSemester(semester)}
                        >
                          <Ionicons name="pencil-outline" size={18} color={colors.secondary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteSemester(semester.id)}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Modal para editar ciclo */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEditModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Ciclo</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número de Ciclo</Text>
                <TextInput
                  style={styles.input}
                  value={editSemesterNumber}
                  onChangeText={setEditSemesterNumber}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Año</Text>
                <TextInput
                  style={styles.input}
                  value={editSemesterYear}
                  onChangeText={setEditSemesterYear}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]}
                  onPress={saveEditedSemester}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>Eliminar Ciclo</Text>
            
            <Text style={styles.deleteModalText}>
              ¿Estás seguro de que deseas eliminar este ciclo?
            </Text>
            
            <View style={styles.checkboxContainer}>
              <Switch
                value={deleteAssociatedCourses}
                onValueChange={setDeleteAssociatedCourses}
                trackColor={{ false: colors.lightGray, true: colors.danger }}
                thumbColor={deleteAssociatedCourses ? colors.danger : colors.gray}
              />
              <Text style={styles.checkboxLabel}>
                Eliminar también las materias asociadas a este ciclo
              </Text>
            </View>
            
            <Text style={styles.warningText}>
              {deleteAssociatedCourses 
                ? "Las materias asociadas a este ciclo se eliminarán permanentemente." 
                : "Las materias asociadas a este ciclo quedarán sin asignación de ciclo."}
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]}
                onPress={confirmDeleteSemester}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
          onPress={() => setFilterType('all')}
        >
          <Text style={filterType === 'all' ? styles.activeFilterText : styles.filterText}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'approved' && styles.approvedFilter]}
          onPress={() => setFilterType('approved')}
        >
          <Text style={filterType === 'approved' ? styles.activeFilterText : styles.filterText}>
            Aprobadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'failed' && styles.failedFilter]}
          onPress={() => setFilterType('failed')}
        >
          <Text style={filterType === 'failed' ? styles.activeFilterText : styles.filterText}>
            Reprobadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'withdrawn' && styles.withdrawnFilter]}
          onPress={() => setFilterType('withdrawn')}
        >
          <Text style={filterType === 'withdrawn' ? styles.activeFilterText : styles.filterText}>
            Retiradas
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={60} color={colors.lightGray} />
          <Text style={styles.emptyText}>No hay materias para estos filtros</Text>
          <Text style={styles.emptySubtext}>Cambia los filtros o agrega materias</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => navigation.navigate('CourseDetail', { 
                courseId: item.id,
                courseName: item.name
              })}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCourse')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
  },
  // Estilos para el selector de semestre
  semesterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  semesterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 16,
    textAlign: 'center',
  },
  semesterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  activeSemesterOption: {
    backgroundColor: colors.lightGray,
  },
  semesterText: {
    fontSize: 16,
    color: colors.darkText,
  },
  activeSemesterText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  // Estilos existentes para filtros de estado
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    overflow: 'hidden',
  },
  filterButton: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  approvedFilter: {
    backgroundColor: colors.success,
  },
  failedFilter: {
    backgroundColor: colors.danger,
  },
  withdrawnFilter: {
    backgroundColor: colors.warning,
  },
  filterText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  activeFilterText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
  // Nuevos estilos para títulos y botones
  sectionTitle: {
    fontSize: 18,
    color: colors.darkText,
    fontWeight: 'normal', // cambiado de 'bold' a 'normal'
    marginBottom: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'normal', // cambiado de 'bold' a 'normal'
    fontSize: 16,
  },
  // Nuevos estilos para fila de ciclos y acciones
  semesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  semesterActions: {
    flexDirection: 'row',
    paddingRight: 4,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  // Estilos para el modal de edición
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Styles for delete confirmation modal
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 16,
    color: colors.darkText,
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.darkText,
    marginLeft: 12,
    flex: 1,
  },
  warningText: {
    fontSize: 13,
    color: colors.danger,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  cancelButtonText: {
    color: colors.darkText,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Resto de estilos existentes
  listContainer: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.darkGray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen;