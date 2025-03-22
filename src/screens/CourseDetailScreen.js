// src/screens/CourseDetailScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { colors } from '../constants/colors';
import ActivityItem from '../components/ActivityItem';

const CourseDetailScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  const { courses, deleteActivity, deleteCourse, semesters } = useData();
  const [sortOrder, setSortOrder] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);
  
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Curso no encontrado</Text>
      </View>
    );
  }
  
  const semester = semesters.find(s => s.id === course.semesterId);
  
  // Ordenar actividades según el criterio seleccionado
  const getSortedActivities = () => {
    if (!course.activities || course.activities.length === 0) return [];
    
    const activities = [...course.activities];
    
    switch (sortOrder) {
      case 'percentage':
        return activities.sort((a, b) => b.percentage - a.percentage);
      case 'grade':
        return activities.sort((a, b) => b.grade - a.grade);
      default:
        return activities;
    }
  };
  
  const getStatusColor = () => {
    switch (course.result) {
      case 'approved': return colors.success;
      case 'failed': return colors.danger;
      case 'withdrawn': return colors.warning;
      default: return colors.primary;
    }
  };
  
  const getStatusText = () => {
    switch (course.result) {
      case 'approved': return 'Aprobada';
      case 'failed': return 'Reprobada';
      case 'withdrawn': return 'Retirada';
      default: return 'Pendiente';
    }
  };
  
  const handleDeleteCourse = () => {
    Alert.alert(
      "Eliminar Materia",
      "¿Estás seguro de que deseas eliminar esta materia? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            deleteCourse(courseId);
            navigation.goBack();
          }
        }
      ]
    );
  };
  
  const handleDeleteActivity = (activityId) => {
    Alert.alert(
      "Eliminar Actividad",
      "¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            deleteActivity(courseId, activityId);
          }
        }
      ]
    );
  };

  const getSortText = (order) => {
    switch (order) {
      case 'default': return 'Por defecto';
      case 'percentage': return 'Porcentaje';
      case 'grade': return 'Nota';
      default: return 'Por defecto';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.courseInfoCard}>
          <View style={styles.courseHeader}>
            <View>
              <Text style={styles.courseCode}>{course.code}</Text>
              <Text style={styles.courseName}>{course.name}</Text>
              {semester && (
                <Text style={styles.semester}>
                  Ciclo: {semester.name} {semester.year}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
            >
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.courseDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Matrícula:</Text>
              <Text style={styles.detailValue}>{course.enrollment}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>UVs:</Text>
              <Text style={styles.detailValue}>{course.uvs}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Nota Final:</Text>
              <Text style={[
                styles.detailValue, 
                course.result === 'approved' ? styles.approvedGrade : 
                course.result === 'failed' ? styles.failedGrade : 
                styles.defaultGrade
              ]}>
                {course.finalGrade.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividades Evaluativas</Text>
            <TouchableOpacity 
              style={styles.sortDropdown}
              onPress={() => setShowSortModal(true)}
            >
              <Text style={styles.sortLabel}>
                Ordenar: <Text style={styles.sortSelected}>{getSortText(sortOrder)}</Text>
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.darkGray} />
            </TouchableOpacity>
          </View>
          
          <Modal
            visible={showSortModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSortModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowSortModal(false)}
            >
              <View style={styles.sortModalContainer}>
                <View style={styles.sortModalContent}>
                  <Text style={styles.sortModalTitle}>Ordenar por</Text>
                  
                  <TouchableOpacity 
                    style={[styles.sortOption, sortOrder === 'default' && styles.activeSortOption]} 
                    onPress={() => {
                      setSortOrder('default');
                      setShowSortModal(false);
                    }}
                  >
                    <Text style={sortOrder === 'default' ? styles.activeSortOptionText : styles.sortOptionText}>
                      Por defecto
                    </Text>
                    {sortOrder === 'default' && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.sortOption, sortOrder === 'percentage' && styles.activeSortOption]} 
                    onPress={() => {
                      setSortOrder('percentage');
                      setShowSortModal(false);
                    }}
                  >
                    <Text style={sortOrder === 'percentage' ? styles.activeSortOptionText : styles.sortOptionText}>
                      Porcentaje
                    </Text>
                    {sortOrder === 'percentage' && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.sortOption, sortOrder === 'grade' && styles.activeSortOption]} 
                    onPress={() => {
                      setSortOrder('grade');
                      setShowSortModal(false);
                    }}
                  >
                    <Text style={sortOrder === 'grade' ? styles.activeSortOptionText : styles.sortOptionText}>
                      Nota
                    </Text>
                    {sortOrder === 'grade' && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
          
          {getSortedActivities().length === 0 ? (
            <View style={styles.emptyActivities}>
              <Ionicons name="document-text-outline" size={40} color={colors.lightGray} />
              <Text style={styles.emptyText}>No hay actividades registradas</Text>
            </View>
          ) : (
            <View style={styles.activitiesList}>
              {getSortedActivities().map(activity => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onDelete={() => handleDeleteActivity(activity.id)}
                />
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteCourse}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Eliminar Materia</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('AddCourse', { 
              isEditing: true,
              course: course
            })}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Editar Materia</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddActivity', {
          courseId: courseId,
          courseName: course.name
        })}
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
  },
  courseInfoCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseCode: {
    fontSize: 14,
    color: colors.gray,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkText,
    marginTop: 4,
    flexShrink: 1,
    maxWidth: '80%', // Limita el ancho del nombre
  },
  semester: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  approvedGrade: {
    color: colors.success,
  },
  failedGrade: {
    color: colors.danger,
  },
  defaultGrade: {
    color: colors.primary,
  },
  activitiesSection: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginRight: 4,
  },
  sortSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sortModalContent: {
    padding: 16,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  activeSortOption: {
    backgroundColor: colors.lightGray,
  },
  sortOptionText: {
    fontSize: 16,
    color: colors.darkText,
  },
  activeSortOptionText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyActivities: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.gray,
  },
  activitiesList: {
    marginBottom: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 80,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  editButton: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
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

export default CourseDetailScreen;