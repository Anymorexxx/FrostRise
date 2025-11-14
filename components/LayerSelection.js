// components/LayerSelection.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors.js';
import { DatabaseService } from '../database/database';

const LayerSelection = ({ 
  layer, 
  onUpdate, 
  soilLambdaF, 
  soilCF 
}) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;
  
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Загрузка материалов при первом рендере
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const materialsData = await DatabaseService.getAllMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const showMaterialSelection = () => {
    if (!materials || materials.length === 0) {
      Alert.alert('Ошибка', 'Данные материалов не загружены');
      return;
    }

    const options = ['Отмена', 'Ручной ввод', ...materials.map(material => material.material_type)];
    
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: options,
        cancelButtonIndex: 0,
        title: 'Выберите материал слоя',
        message: 'Выберите из базы данных или введите вручную',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) return; // Отмена
        if (buttonIndex === 1) {
          handleManualInput();
          return;
        }
        
        const selectedIndex = buttonIndex - 2;
        const selected = materials[selectedIndex];
        if (selected) {
          handleMaterialSelection(selected);
        }
      }
    );
  };

  const handleMaterialSelection = (material) => {
    setSelectedMaterial(material);
    
    // Автоматически заполняем параметры из выбранного материала
    onUpdate(layer.id, {
      name: material.material_type,
      density: material.rho_d?.toString() || '',
      moisture: material.w?.toString() || '',
      lambdaF: material.lambda_f?.toString() || '',
      cF: material.C_f?.toString() || ''
    });
  };

  const handleManualInput = () => {
    setSelectedMaterial(null);
    onUpdate(layer.id, {
      name: `Слой ${layer.id}`,
      density: '',
      moisture: '',
      lambdaF: '',
      cF: ''
    });
  };

  const updateField = (field, value) => {
    onUpdate(layer.id, { [field]: value });
  };

  return (
    <View style={[styles.layerContainer, { borderColor: currentColors.inputBorder }]}>
      {/* Заголовок слоя с выбором материала */}
      <TouchableOpacity 
        style={[styles.layerHeader, { 
          backgroundColor: currentColors.inputBackground 
        }]}
        onPress={showMaterialSelection}
      >
        <Text style={[styles.layerTitle, { color: currentColors.text }]}>
          {layer.name || `Слой ${layer.id}`}
        </Text>
        <Text style={[styles.layerSubtitle, { color: currentColors.constantText }]}>
          {selectedMaterial ? `📁 ${selectedMaterial.material_type}` : '✏️ Ручной ввод'}
        </Text>
      </TouchableOpacity>

      {/* Поля ввода */}
      <View style={styles.inputRow}>
        <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Толщина (м)</Text>
        <TextInput
          style={[styles.inputField, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder,
            color: currentColors.text 
          }]}
          value={layer.thickness}
          onChangeText={(value) => updateField('thickness', value)}
          keyboardType="decimal-pad"
          placeholder="0.20"
          placeholderTextColor={currentColors.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Плотность (кг/м³)</Text>
        <TextInput
          style={[styles.inputField, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder,
            color: currentColors.text 
          }]}
          value={layer.density}
          onChangeText={(value) => updateField('density', value)}
          keyboardType="decimal-pad"
          placeholder="2300"
          placeholderTextColor={currentColors.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Влажность (д.е.)</Text>
        <TextInput
          style={[styles.inputField, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder,
            color: currentColors.text 
          }]}
          value={layer.moisture}
          onChangeText={(value) => updateField('moisture', value)}
          keyboardType="decimal-pad"
          placeholder="0.03"
          placeholderTextColor={currentColors.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>λf (Вт/(м·°C))</Text>
        <TextInput
          style={[styles.inputField, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder,
            color: currentColors.text 
          }]}
          value={layer.lambdaF}
          onChangeText={(value) => updateField('lambdaF', value)}
          keyboardType="decimal-pad"
          placeholder={soilLambdaF || "1.90"}
          placeholderTextColor={currentColors.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Cf (кДж/(м³·°C))</Text>
        <TextInput
          style={[styles.inputField, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder,
            color: currentColors.text 
          }]}
          value={layer.cF}
          onChangeText={(value) => updateField('cF', value)}
          keyboardType="decimal-pad"
          placeholder={soilCF || "1675"}
          placeholderTextColor={currentColors.inputText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  layerContainer: {
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  layerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  layerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  layerSubtitle: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '500',
    flex: 1,
  },
  inputField: {
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontSize: 12,
    flex: 2,
  },
});

export default LayerSelection;