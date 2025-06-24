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
    inscribibleUVs: 20 
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
  
  // Añadir este nuevo useEffect para guardar los semestres
  useEffect(() => {
    if (!loading) {
      saveSemesters();
    }
  }, [semesters, loading]);

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
    try {
      // Asegurarse de que courses es un array antes de usarlo
      const validCourses = Array.isArray(courses) ? courses : [];
      
      // Contar cursos por estado
      const approved = validCourses.filter(course => course.result === 'approved').length;
      const failed = validCourses.filter(course => course.result === 'failed').length;
      const withdrawn = validCourses.filter(course => course.result === 'withdrawn').length;
      
      // Calcular promedio general (todas las materias)
      const coursesForAverage = validCourses.filter(course => course.result !== 'withdrawn');
      const generalAverage = coursesForAverage.length > 0 
        ? coursesForAverage.reduce((sum, course) => sum + course.finalGrade, 0) / coursesForAverage.length 
        : 0;
      
      // Calcular CUM por semestre
      const semesterCUMs = {};
      semesters.forEach(semester => {
        const semesterCourses = validCourses.filter(course => course.semesterId === semester.id);
        semesterCUMs[semester.id] = calculateCUM(semesterCourses);
      });
      
      // Calcular CUM general (promedio de CUMs por semestre)
      const validCoursesForCUM = validCourses.filter(course => 
        course.result === 'approved'
      );
      const generalCUM = calculateGeneralCUM(validCoursesForCUM);
      
      // Calcular UVs inscribibles para el próximo semestre basado en el CUM general
      // en lugar del CUM del último semestre
      const inscribibleUVs = calculateInscribibleUVs(generalCUM);
      
      setStats({
        approvedCourses: approved,
        failedCourses: failed,
        withdrawnCourses: withdrawn,
        generalAverage: parseFloat(generalAverage.toFixed(1)),
        generalCUM: parseFloat(generalCUM.toFixed(1)),
        inscribibleUVs
      });
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      // Asegurarse de que stats tiene valores predeterminados en caso de error
      setStats(prevStats => ({
        ...prevStats,
        generalCUM: 0
      }));
    }
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
    // No es necesario llamar a saveSemesters() aquí porque el useEffect se encargará
    // saveSemesters(); <- Eliminar o comentar esta línea
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

  // Función para actualizar una actividad existente
  const updateActivity = (courseId, activityId, updatedActivity) => {
    setCourses(prevCourses => 
      prevCourses.map(course => {
        if (course.id !== courseId) return course;
        
        // Actualizar la actividad específica
        const updatedActivities = course.activities.map(activity => 
          activity.id === activityId ? { ...activity, ...updatedActivity } : activity
        );
        
        // Recalcular la nota final basada en las actividades actualizadas
        const updatedFinalGrade = calculateFinalGrade({ ...course, activities: updatedActivities });
        
        // Actualizar el curso con las actividades actualizadas y la nueva nota final
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
      console.log("Iniciando importación/limpieza de datos");
      
      // Primero, guardar en AsyncStorage
      await AsyncStorage.setItem('courses', JSON.stringify(importedCourses));
      await AsyncStorage.setItem('semesters', JSON.stringify(importedSemesters));
      
      // Luego actualizar el estado
      setCourses(importedCourses);
      setSemesters(importedSemesters);
      
      // Crear un objeto de estadísticas fresco en lugar de confiar en updateStats
      // Esto garantiza que las estadísticas se calculen con los datos nuevos
      const approved = importedCourses.filter(course => course.result === 'approved').length;
      const failed = importedCourses.filter(course => course.result === 'failed').length;
      const withdrawn = importedCourses.filter(course => course.result === 'withdrawn').length;
      
      // Calcular promedio general
      const coursesForAverage = importedCourses.filter(course => course.result !== 'withdrawn');
      const generalAverage = coursesForAverage.length > 0 
        ? coursesForAverage.reduce((sum, course) => sum + course.finalGrade, 0) / coursesForAverage.length 
        : 0;
      
      // Calcular CUM general
      const validCoursesForCUM = importedCourses.filter(course => 
        course.result === 'approved'
      );
      const generalCUM = calculateGeneralCUM(validCoursesForCUM);
      
      // Calcular UVs inscribibles o usar valor predeterminado
      const inscribibleUVs = importedCourses.length > 0 
        ? calculateInscribibleUVs(generalCUM) 
        : 20;
      
      // Actualizar estadísticas directamente
      setStats({
        approvedCourses: approved,
        failedCourses: failed,
        withdrawnCourses: withdrawn,
        generalAverage: parseFloat(generalAverage.toFixed(1)),
        generalCUM: parseFloat(generalCUM.toFixed(1)),
        inscribibleUVs
      });
      
      console.log("Importación/limpieza completada con éxito");
      return true;
    } catch (error) {
      console.error("Error en loadFullData:", error);
      return false;
    }
  };

  // Actualizar un semestre
  const updateSemester = (semesterId, updatedData) => {
    setSemesters(prevSemesters => 
      prevSemesters.map(semester => 
        semester.id === semesterId 
          ? { 
              ...semester, 
              ...updatedData
            } 
          : semester
      )
    );
  };

  // Eliminar un semestre
  const deleteSemester = (semesterId) => {
    setSemesters(prevSemesters => prevSemesters.filter(semester => semester.id !== semesterId));
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
    updateActivity,
    deleteActivity,
    addSemester,
    updateSemester, // Add this new function
    deleteSemester, // Add this new function
    loadFullData,
    updateStats, // Agregar esta función al contexto
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};