// components/LayerDetails.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors.js';

const LayerDetails = ({ layer, calculationDetails, isExpanded, onToggle }) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;

  return (
    <View style={[styles.layerContainer, { borderColor: currentColors.inputBorder }]}>
      {/* Заголовок слоя */}
      <TouchableOpacity 
        style={[styles.layerHeader, { 
          backgroundColor: currentColors.inputBackground 
        }]}
        onPress={onToggle}
      >
        <Text style={[styles.layerTitle, { color: currentColors.text }]}>
          {layer.name}
        </Text>
        <Text style={[styles.expandIcon, { color: currentColors.constantText }]}>
          {isExpanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Детали слоя (показываются только при раскрытии) */}
      {isExpanded && (
        <View style={styles.layerDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: currentColors.inputText }]}>Толщина:</Text>
            <Text style={[styles.detailValue, { color: currentColors.text }]}>{layer.thickness} м</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: currentColors.inputText }]}>Плотность:</Text>
            <Text style={[styles.detailValue, { color: currentColors.text }]}>{layer.density} кг/м³</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: currentColors.inputText }]}>Влажность:</Text>
            <Text style={[styles.detailValue, { color: currentColors.text }]}>{layer.moisture} д.е.</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: currentColors.inputText }]}>λf:</Text>
            <Text style={[styles.detailValue, { color: currentColors.text }]}>{layer.lambdaF} Вт/(м·°C)</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: currentColors.inputText }]}>Cf:</Text>
            <Text style={[styles.detailValue, { color: currentColors.text }]}>{layer.cF} кДж/(м³·°C)</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  layerContainer: {
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  layerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  layerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    marginLeft: 8,
  },
  layerDetails: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default LayerDetails;