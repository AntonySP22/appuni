// src/components/CourseCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const CourseCard = ({ course, onPress }) => {
  const getStatusColor = () => {
    switch (course.result) {
      case 'approved': return colors.success;
      case 'failed': return colors.danger;
      case 'withdrawn': return colors.warning;
      default: return colors.gray;
    }
  };

  const getStatusIcon = () => {
    switch (course.result) {
      case 'approved': return 'checkmark-circle';
      case 'failed': return 'close-circle';
      case 'withdrawn': return 'alert-circle';
      default: return 'time-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.code}>{course.code}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Ionicons name={getStatusIcon()} size={14} color="white" />
        </View>
      </View>
      
      <Text style={styles.name}>{course.name}</Text>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Matrícula</Text>
          <Text style={styles.detailValue}>{course.enrollment}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>UVs</Text>
          <Text style={styles.detailValue}>{course.uvs}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Nota</Text>
          <Text style={[
            styles.detailValue,
            { color: getStatusColor() }
          ]}>
            {course.finalGrade.toFixed(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    color: colors.gray,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
  },
});

export default CourseCard;