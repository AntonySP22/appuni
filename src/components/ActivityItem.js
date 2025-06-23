// src/components/ActivityItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const ActivityItem = ({ activity, onDelete, onEdit }) => {
  // Add safeguards for when activity might be missing properties
  if (!activity) {
    return null; // Return nothing if activity is undefined
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getGradeColor = (grade) => {
    if (grade === undefined || grade === null) return colors.gray;
    if (grade >= 6.0) return colors.success;
    return colors.danger;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{activity.name || 'Sin nombre'}</Text>
          <Text style={styles.date}>{formatDate(activity.date || new Date())}</Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEdit}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      
      {activity.description ? (
        <Text style={styles.description}>{activity.description}</Text>
      ) : null}
      
      <View style={styles.details}>
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageValue}>{activity.percentage || 0}%</Text>
          <Text style={styles.percentageLabel}>Porcentaje</Text>
        </View>
        
        <View style={styles.gradeContainer}>
          <Text style={[
            styles.gradeValue, 
            { color: getGradeColor(activity.grade) }
          ]}>
            {(activity.grade || 0).toFixed(1)}
          </Text>
          <Text style={styles.gradeLabel}>Nota</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  date: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 4,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: colors.darkGray,
    marginVertical: 8,
    fontStyle: 'italic',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  percentageContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  percentageValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  percentageLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  gradeContainer: {
    alignItems: 'center',
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gradeLabel: {
    fontSize: 12,
    color: colors.gray,
  },
});

export default ActivityItem;