// src/components/StatsSummary.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useData } from '../contexts/DataContext';

const StatsSummary = ({ stats }) => {
  const { semesters, courses } = useData();
  const [showCumModal, setShowCumModal] = useState(false);
  
  // Calcular el CUM por ciclo
  const calculateSemesterCUM = (semesterId) => {
    const semesterCourses = courses.filter(course => course.semesterId === semesterId && course.result !== 'withdrawn');
    
    if (semesterCourses.length === 0) return 0;
    
    let totalUVs = 0;
    let totalUMs = 0;
    
    semesterCourses.forEach(course => {
      totalUVs += course.uvs;
      totalUMs += course.uvs * course.finalGrade;
    });
    
    return totalUVs > 0 ? parseFloat((totalUMs / totalUVs).toFixed(1)) : 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.statCard, styles.approved]}>
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text style={styles.statCount}>{stats.approvedCourses}</Text>
          <Text style={styles.statLabel}>Aprobadas</Text>
        </View>
        
        <View style={[styles.statCard, styles.failed]}>
          <Ionicons name="close-circle" size={24} color="white" />
          <Text style={styles.statCount}>{stats.failedCourses}</Text>
          <Text style={styles.statLabel}>Reprobadas</Text>
        </View>
        
        <View style={[styles.statCard, styles.withdrawn]}>
          <Ionicons name="alert-circle" size={24} color="white" />
          <Text style={styles.statCount}>{stats.withdrawnCourses}</Text>
          <Text style={styles.statLabel}>Retiradas</Text>
        </View>
      </View>
      
      <View style={styles.row}>
        <View style={[styles.infoCard, styles.average]}>
          <Text style={styles.infoLabel}>Promedio</Text>
          <Text style={styles.infoValue}>{stats.generalAverage.toFixed(1)}</Text>
        </View>
        
        {/* CUM Card - Ahora con TouchableOpacity */}
        <TouchableOpacity 
          style={[styles.infoCard, styles.cum]}
          onPress={() => setShowCumModal(true)}
        >
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={18} color={colors.secondary} />
          </View>
          <Text style={styles.infoLabel}>CUM General</Text>
          <Text style={styles.infoValue}>{stats.generalCUM.toFixed(1)}</Text>
        </TouchableOpacity>
        
        <View style={[styles.infoCard, styles.uvs]}>
          <Text style={styles.infoLabel}>UVs Inscribibles</Text>
          <Text style={styles.infoValue}>{stats.inscribibleUVs}</Text>
        </View>
      </View>

      {/* Modal para mostrar el CUM por ciclo */}
      <Modal
        visible={showCumModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCumModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCumModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>CUM por Ciclo</Text>
              
              {semesters.length === 0 ? (
                <Text style={styles.noDataText}>No hay ciclos registrados</Text>
              ) : (
                <>
                  {semesters.map((semester) => {
                    const semesterCUM = calculateSemesterCUM(semester.id);
                    return (
                      <View key={semester.id} style={styles.cumRow}>
                        <Text style={styles.cumSemesterName}>
                          {semester.name} {semester.year}
                        </Text>
                        <View style={styles.cumValueContainer}>
                          <Text 
                            style={[
                              styles.cumValue,
                              semesterCUM >= 7.0 ? styles.highCUM : 
                              semesterCUM >= 6.0 ? styles.mediumCUM : styles.lowCUM
                            ]}
                          >
                            {semesterCUM.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  
                  <View style={[styles.cumRow, styles.generalCumRow]}>
                    <Text style={styles.generalCumLabel}>CUM General</Text>
                    <View style={styles.cumValueContainer}>
                      <Text 
                        style={[
                          styles.cumValue, styles.generalCumValue,
                          stats.generalCUM >= 7.0 ? styles.highCUM : 
                          stats.generalCUM >= 6.0 ? styles.mediumCUM : styles.lowCUM
                        ]}
                      >
                        {stats.generalCUM.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCumModal(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  approved: {
    backgroundColor: colors.success,
  },
  failed: {
    backgroundColor: colors.danger,
  },
  withdrawn: {
    backgroundColor: colors.warning,
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    marginTop: 2,
  },
  infoCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    paddingTop: 16, // Aumentar el padding superior para dar más espacio
    paddingBottom: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    minHeight: 80, // Asegurar una altura mínima
  },
  average: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  cum: {
    borderTopWidth: 3,
    borderTopColor: colors.secondary,
    position: 'relative', // Para posicionar el ícono
  },
  uvs: {
    borderTopWidth: 3,
    borderTopColor: colors.tertiary,
  },
  infoIconContainer: {
    position: 'absolute',
    top: 6,
    right: 6, // Cambia a right para posicionar a la derecha
  },
  infoLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 8, // Aumentar el espacio entre la etiqueta y el valor
    marginTop: 4, // Añadir margen superior
  },
  infoValue: {
    fontSize: 18,
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
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 16,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginVertical: 20,
  },
  cumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  cumSemesterName: {
    fontSize: 16,
    color: colors.darkText,
  },
  cumValueContainer: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  cumValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  highCUM: {
    color: colors.success,
  },
  mediumCUM: {
    color: colors.primary,
  },
  lowCUM: {
    color: colors.danger,
  },
  generalCumRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    borderBottomWidth: 0,
  },
  generalCumLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  generalCumValue: {
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StatsSummary;