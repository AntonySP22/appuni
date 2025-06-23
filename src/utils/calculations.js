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
    
    // Redondear correctamente a 1 decimal
    return Math.round(cum * 10) / 10;
};
  
/**
 * Calcula el CUM general acumulado sumando todas las UMs y UVs
 * @param {Array} courses - Lista completa de cursos
 * @returns {number} - CUM general redondeado a 1 decimal
 */
export const calculateGeneralCUM = (courses) => {
    // Verificar que courses es un array
    if (!Array.isArray(courses) || courses.length === 0) return 0;
    
    // Filtrar cursos retirados y reprobados
    const validCourses = courses.filter(course => 
        course.result !== 'withdrawn' && 
        course.finalGrade >= 6.0  // Solo materias aprobadas
    );
    
    if (validCourses.length === 0) return 0;
    
    // Calcular UVs y UMs totales
    let totalUVs = 0;
    let totalUMs = 0;
    
    validCourses.forEach(course => {
      totalUVs += course.uvs;
      totalUMs += course.uvs * course.finalGrade;
    });
    
    // Mostrar los cálculos en consola
    console.log('Cálculo de CUM global:');
    console.log('Total UVs:', totalUVs);
    console.log('Total UMs:', totalUMs);
    console.log('CUM Global (UMs/UVs):', totalUMs / totalUVs);
    
    // Calcular CUM global y redondear correctamente a 1 decimal
    const cum = totalUVs > 0 ? totalUMs / totalUVs : 0;
    
    // Usando Math.round para redondeo correcto (1.65 → 1.7)
    return Math.round(cum * 10) / 10;
};
  
/**
 * Calcula la cantidad de UVs inscribibles según el CUM
 * @param {number} cum - CUM actual del estudiante
 * @returns {number} - Cantidad de UVs que puede inscribir
 */
export const calculateInscribibleUVs = (cum) => {
  if (cum >= 7.5) {
    return 32;  // Excelente rendimiento
  } else if (cum >= 7.0) {
    return 24;  // Muy buen rendimiento
  } else if (cum >= 6.0) {
    return 20;  // Rendimiento aceptable
  } else if (cum == 0) {
    return 20;  // No hay materias, nuevo ingreso
  } else {
    return 16;  // Bajo rendimiento ya si es menor de 6.0 osea de 5.99 para abajo
  }
};