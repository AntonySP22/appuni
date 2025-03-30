// src/utils/calculations.js
/**
 * Calcula el CUM para un conjunto de cursos
 * @param {Array} courses - Lista de cursos de un semestre
 * @returns {number} - CUM calculado
 */
export const calculateCUM = (courses) => {
    // Filtrar cursos retirados y reprobados
    const validCourses = courses.filter(course => 
        course.result !== 'withdrawn' && 
        course.finalGrade >= 6.0  // Asumiendo que 6.0 es la nota mínima para aprobar
    );
    
    if (validCourses.length === 0) return 0;
    
    // Calcular UVs y UMs totales
    let totalUVs = 0;
    let totalUMs = 0;
    
    validCourses.forEach(course => {
      totalUVs += course.uvs;
      totalUMs += course.uvs * course.finalGrade;
    });
    
    // Calcular CUM
    const cum = totalUVs > 0 ? totalUMs / totalUVs : 0;
    
    return parseFloat(cum.toFixed(1));
};
  
/**
 * Calcula el CUM general (promedio de CUMs de cada semestre)
 * @param {Object} semesterCUMs - Objeto con CUMs por semestre
 * @returns {number} - CUM general
 */
export const calculateGeneralCUM = (semesterCUMs) => {
    const cums = Object.values(semesterCUMs).filter(cum => cum > 0);
    
    if (cums.length === 0) return 0;
    
    const totalCUM = cums.reduce((sum, cum) => sum + cum, 0);
    return parseFloat((totalCUM / cums.length).toFixed(1));
};
  
/**
 * Calcula las UVs inscribibles para el siguiente semestre
 * @param {number} cum - CUM del semestre actual
 * @returns {number} - UVs inscribibles
 */
export const calculateInscribibleUVs = (cum) => {
    if (cum >= 7.5) return 32;
    if (cum >= 7.0) return 24;
    if (cum >= 6.0) return 20;
    return 16;
};