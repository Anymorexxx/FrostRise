// components/CalculationFormulas.js
import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors.js';

const CalculationFormulas = ({ calculationDetails }) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;

  if (!calculationDetails) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.inputBackground }]}>
        <Text style={[styles.noDataText, { color: currentColors.text }]}>
          Детали расчета недоступны
        </Text>
      </View>
    );
  }

  const {
    parameters = {},
    summation = 0,
    eta_f_soil = 0,
    eta_f_0_soil = 0
  } = calculationDetails;

  return (
    <View style={[styles.container, { backgroundColor: currentColors.inputBackground }]}>
      <Text style={[styles.title, { color: currentColors.sectionTitle }]}>
        Детали расчета:
      </Text>

      {/* Формула коэффициента kw */}
      <View style={styles.formulaSection}>
        <Text style={[styles.formulaLabel, { color: currentColors.inputText }]}>
          Коэффициент влажности:
        </Text>
        <Text style={[styles.formula, { color: currentColors.text }]}>
          W_w = k_w × W_p = 0.65 × {parameters.wp || 'Wp'} = {(0.65 * parseFloat(parameters.wp || 0)).toFixed(3)}
        </Text>
      </View>

      {/* Формула η_f */}
      <View style={styles.formulaSection}>
        <Text style={[styles.formulaLabel, { color: currentColors.inputText }]}>
          Теплоемкость слоев:
        </Text>
        <Text style={[styles.result, { color: currentColors.text }]}>
          • η_f конструкционных слоев: 0.5 × θ_mp × C_f + ρ_d × W × L
        </Text>
        <Text style={[styles.result, { color: currentColors.text }]}>
          • η_f грунта: 0.5 × θ_mp × C_f + ρ_d × (W - W_w) × L = {eta_f_soil?.toFixed(1) || 'N/A'}
        </Text>
        <Text style={[styles.result, { color: currentColors.text }]}>
          • η_f₀ грунта: 0.5 × t₀ × C_f + ρ_d × (W - W_w) × L = {eta_f_0_soil?.toFixed(1) || 'N/A'}
        </Text>
      </View>

      {/* Сумма Σ */}
      <View style={styles.formulaSection}>
        <Text style={[styles.formulaLabel, { color: currentColors.inputText }]}>
          Сумма слоев:
        </Text>
        <Text style={[styles.result, { color: currentColors.text }]}>
          Σ = ∑[h_i × √(λ_f_грунт × η_f_i / (λ_f_i × η_f_грунт))] = {summation}
        </Text>
      </View>

      {/* Параметры расчета */}
      <View style={styles.parametersSection}>
        <Text style={[styles.parametersTitle, { color: currentColors.sectionTitle }]}>
          Параметры расчета:
        </Text>
        <Text style={[styles.parameter, { color: currentColors.text }]}>
          • θ_mp (средняя температура): {parameters.theta_mp || 12.51} °C
        </Text>
        <Text style={[styles.parameter, { color: currentColors.text }]}>
          • τ_f (Продолжительность периода отрицательных температур): {parameters.tau_f || 3624} ч
        </Text>
        <Text style={[styles.parameter, { color: currentColors.text }]}>
          • L (теплота фазового перехода): {parameters.L || 334} кДж/кг
        </Text>
        <Text style={[styles.parameter, { color: currentColors.text }]}>
          • t₀ (начальная температура грунта): {parameters.t0 || 1.5} °C
        </Text>
        <Text style={[styles.parameter, { color: currentColors.text }]}>
          • k_w (коэффициент влажности): {parameters.kw || 0.65}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
    marginBottom: 15,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formulaSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  formulaLabel: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '500',
    marginBottom: 6,
  },
  formula: {
    fontSize: 11,
    fontFamily: 'IBM-Plex-Mono-Regular',
    marginBottom: 2,
  },
  result: {
    fontSize: 11,
    fontFamily: 'IBM-Plex-Mono-Regular',
    marginBottom: 4,
    lineHeight: 16,
  },
  parametersSection: {
    marginTop: 8,
  },
  parametersTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
    marginBottom: 6,
  },
  parameter: {
    fontSize: 11,
    fontFamily: 'IBM-Plex-Mono-Regular',
    marginBottom: 3,
    lineHeight: 16,
  },
});

export default CalculationFormulas;