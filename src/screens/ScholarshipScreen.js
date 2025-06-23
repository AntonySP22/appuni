import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { Ionicons } from '@expo/vector-icons';

const ScholarshipScreen = () => {
  const { stats } = useData();
  const [showRules, setShowRules] = useState(false);
  
  // Valor base del apoyo FAE
  const baseAmount = 4964;
  
  // Calcular el porcentaje y monto a recontribuir según el CUM
  const calculatedData = useMemo(() => {
    const cum = stats.generalCUM;
    let percentage = 0;
    let description = '';
    
    if (cum >= 9.0) {
      percentage = 0.05;
      description = 'Excelente desempeño académico';
    } else if (cum >= 8.0) {
      percentage = 0.10;
      description = 'Muy buen desempeño académico';
    } else if (cum >= 7.0) {
      percentage = 0.20;
      description = 'Buen desempeño académico';
    } else {
      percentage = 1.0;
      description = 'Bajo rendimiento académico';
    }
    
    const amountToReturn = baseAmount * percentage;
    
    return {
      percentage: percentage * 100,
      amount: amountToReturn,
      description
    };
  }, [stats.generalCUM]);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Información de Beca</Text>
        
        <View style={styles.cumContainer}>
          <Text style={styles.cumLabel}>CUM actual</Text>
          <Text style={styles.cumValue}>{stats.generalCUM.toFixed(1)}</Text>
          <Text style={styles.cumDescription}>{calculatedData.description}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Valor base del apoyo:</Text>
          <Text style={styles.value}>${baseAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Porcentaje a recontribuir:</Text>
          <Text style={styles.value}>{calculatedData.percentage}%</Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Monto a recontribuir:</Text>
          <Text style={styles.resultValue}>${calculatedData.amount.toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.rulesButton} 
          onPress={() => setShowRules(!showRules)}
        >
          <Text style={styles.rulesButtonText}>
            {showRules ? 'Ocultar reglas' : 'Ver reglas de recontribución'}
          </Text>
          <Ionicons 
            name={showRules ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        
        {showRules && (
          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Reglas de recontribución al FAE</Text>
            
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} style={styles.ruleIcon} />
              <Text style={styles.ruleText}>CUM ≥ 9.0: 5% del apoyo total</Text>
            </View>
            
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.secondary} style={styles.ruleIcon} />
              <Text style={styles.ruleText}>CUM ≥ 8.0 y {'<'} 9.0: 10% del apoyo total</Text>
            </View>
            
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.warning} style={styles.ruleIcon} />
              <Text style={styles.ruleText}>CUM ≥ 7.0 y {'<'} 8.0: 20% del apoyo total</Text>
            </View>
            
            <View style={styles.ruleItem}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} style={styles.ruleIcon} />
              <Text style={styles.ruleText}>CUM {'<'} 7.0: 100% del apoyo total</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  cumContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cumLabel: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 4,
  },
  cumValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  cumDescription: {
    fontSize: 14,
    color: colors.secondary,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  label: {
    fontSize: 15,
    color: colors.darkGray,
  },
  value: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  rulesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  rulesButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
    textDecorationLine: 'underline',
  },
  rulesContainer: {
    marginTop: 18,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 12,
    textAlign: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ruleIcon: {
    marginRight: 8,
  },
  ruleText: {
    fontSize: 14,
    color: colors.darkText,
  },
});

export default ScholarshipScreen;