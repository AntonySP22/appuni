// src/contexts/DataContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateCUM, calculateGeneralCUM, calculateInscribibleUVs } from '../utils/calculations';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    approvedCourses: 0,
    failedCourses: 0,
    withdrawnCourses: 0,
    generalAverage: 0,
    generalCUM: 0,
    inscribibleUVs: 16 // Valor por defecto
  });

  // Cargar datos almacenados
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCourses = await AsyncStorage.getItem('courses');
        const storedSemesters = await AsyncStorage.getItem('semesters');
        
        if (storedCourses) setCourses(JSON.parse(storedCourses));
        if (storedSemesters) setSemesters(JSON.parse(storedSemesters));
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Actualizar estadísticas cuando cambian los cursos
  useEffect(() => {
    if (!loading) {
      updateStats();
      saveCourses();
    }
  }, [courses, loading]);

  // Guardar cursos en AsyncStorage
  const saveCourses = async () => {
    try {
      await AsyncStorage.setItem('courses', JSON.stringify(courses));
    } catch (error) {
      console.error('Error saving courses:', error);
    }
  };

  // Guardar semestres en AsyncStorage
  const saveSemesters = async () => {
    try {
      await AsyncStorage.setItem('semesters', JSON.stringify(semesters));
    } catch (error) {
      console.error('Error saving semesters:', error);
    }
  };

  // Actualizar estadísticas
  const updateStats = () => {
    // Contar cursos por estado
    const approved = courses.filter(course => course.result === 'approved').length;
    const failed = courses.filter(course => course.result === 'failed').length;
    const withdrawn = courses.filter(course => course.result === 'withdrawn').length;
    
    // Calcular promedio general (todas las materias)
    const validCourses = courses.filter(course => course.result !== 'withdrawn');
    const generalAverage = validCourses.length > 0 
      ? validCourses.reduce((sum, course) => sum + course.finalGrade, 0) / validCourses.length 
      : 0;
    
    // Calcular CUM por semestre
    const semesterCUMs = {};
    semesters.forEach(semester => {
      const semesterCourses = courses.filter(course => course.semesterId === semester.id);
      semesterCUMs[semester.id] = calculateCUM(semesterCourses);
    });
    
    // Calcular CUM general (promedio de CUMs por semestre)
    const generalCUM = calculateGeneralCUM(semesterCUMs);
    
    // Calcular UVs inscribibles para el próximo semestre
    const lastSemester = semesters[semesters.length - 1];
    const inscribibleUVs = lastSemester 
      ? calculateInscribibleUVs(semesterCUMs[lastSemester.id]) 
      : 16;
    
    setStats({
      approvedCourses: approved,
      failedCourses: failed,
      withdrawnCourses: withdrawn,
      generalAverage: parseFloat(generalAverage.toFixed(1)),
      generalCUM: parseFloat(generalCUM.toFixed(1)),
      inscribibleUVs
    });
  };

  // Añadir un nuevo curso
  const addCourse = (newCourse) => {
    setCourses(prevCourses => [...prevCourses, {
      id: Date.now().toString(),
      ...newCourse,
      activities: []
    }]);
  };

  // Añadir una nueva actividad a un curso
  const addActivity = (courseId, activity) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? {
              ...course,
              activities: [...course.activities, {
                id: Date.now().toString(),
                ...activity
              }],
              finalGrade: calculateFinalGrade({
                ...course,
                activities: [...course.activities, activity]
              }),
              result: determineResult({
                ...course,
                finalGrade: calculateFinalGrade({
                  ...course,
                  activities: [...course.activities, activity]
                })
              })
            }
          : course
      )
    );
  };

  // Calcular la nota final de un curso en base a sus actividades
  const calculateFinalGrade = (course) => {
    if (!course.activities || course.activities.length === 0) return 0;
    
    const total = course.activities.reduce((sum, activity) => {
      return sum + (activity.grade * activity.percentage / 100);
    }, 0);
    
    return parseFloat(total.toFixed(1));
  };

  // Determinar si un curso está aprobado, reprobado o retirado
  const determineResult = (course) => {
    if (course.status === 'withdrawn') return 'withdrawn';
    return course.finalGrade >= 6.0 ? 'approved' : 'failed';
  };

  // Añadir un nuevo semestre
  const addSemester = (semester) => {
    const newSemester = {
      id: Date.now().toString(),
      ...semester
    };
    
    setSemesters(prevSemesters => [...prevSemesters, newSemester]);
    saveSemesters();
    return newSemester;
  };

  // Actualizar un curso
  const updateCourse = (courseId, updatedData) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? { ...course, ...updatedData } 
          : course
      )
    );
  };

  // Eliminar un curso
  const deleteCourse = (courseId) => {
    setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
  };

  // Eliminar una actividad
  const deleteActivity = (courseId, activityId) => {
    setCourses(prevCourses => 
      prevCourses.map(course => {
        if (course.id !== courseId) return course;
        
        const updatedActivities = course.activities.filter(act => act.id !== activityId);
        const updatedFinalGrade = calculateFinalGrade({ ...course, activities: updatedActivities });
        
        return {
          ...course,
          activities: updatedActivities,
          finalGrade: updatedFinalGrade,
          result: determineResult({ ...course, finalGrade: updatedFinalGrade })
        };
      })
    );
  };

  const loadFullData = async (importedCourses, importedSemesters) => {
    try {
      console.log("Iniciando importación de datos");
      
      // Primero vaciar los datos actuales
      setCourses([]);
      setSemesters([]);
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('courses', JSON.stringify(importedCourses));
      await AsyncStorage.setItem('semesters', JSON.stringify(importedSemesters));
      
      // Aplicar los nuevos datos
      setCourses(importedCourses);
      setSemesters(importedSemesters);
      
      // Forzar actualización de estadísticas
      setTimeout(updateStats, 500);
      
      console.log("Importación completada con éxito");
      return true;
    } catch (error) {
      console.error("Error en loadFullData:", error);
      return false;
    }
  };

  const value = {
    courses,
    semesters,
    stats,
    loading,
    addCourse,
    updateCourse,
    deleteCourse,
    addActivity,
    deleteActivity,
    addSemester,
    loadFullData, // Añade esta línea
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};