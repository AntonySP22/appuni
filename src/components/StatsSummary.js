// src/components/StatsSummary.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const StatsSummary = ({ stats }) => {
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
        
        <View style={[styles.infoCard, styles.cum]}>
          <Text style={styles.infoLabel}>CUM General</Text>
          <Text style={styles.infoValue}>{stats.generalCUM.toFixed(1)}</Text>
        </View>
        
        <View style={[styles.infoCard, styles.uvs]}>
          <Text style={styles.infoLabel}>UVs Inscribibles</Text>
          <Text style={styles.infoValue}>{stats.inscribibleUVs}</Text>
        </View>
      </View>
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
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  average: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  cum: {
    borderTopWidth: 3,
    borderTopColor: colors.secondary,
  },
  uvs: {
    borderTopWidth: 3,
    borderTopColor: colors.tertiary,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkText,
  },
});

export default StatsSummary;