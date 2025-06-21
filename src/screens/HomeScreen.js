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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import CourseCard from '../components/CourseCard';
import StatsSummary from '../components/StatsSummary';
import { colors } from '../constants/colors';

const HomeScreen = ({ navigation }) => {
  const { courses, semesters, stats, loading } = useData();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [showSemesterModal, setShowSemesterModal] = useState(false);

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
                    <TouchableOpacity 
                      key={semester.id}
                      style={[
                        styles.semesterOption, 
                        selectedSemester === semester.id && styles.activeSemesterOption
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
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
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