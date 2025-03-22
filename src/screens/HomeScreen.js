// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import CourseCard from '../components/CourseCard';
import StatsSummary from '../components/StatsSummary';
import { colors } from '../constants/colors';

const HomeScreen = ({ navigation }) => {
  const { courses, stats, loading } = useData();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter(course => course.result === filterType));
    }
  }, [courses, filterType]);

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
          <Text style={styles.emptyText}>No hay materias registradas</Text>
          <Text style={styles.emptySubtext}>Agrega una materia para comenzar</Text>
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