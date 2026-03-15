// components/LayerSelection.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  ScrollView,
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
  const [showMaterialModal, setShowMaterialModal] = useState(false);

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
    setShowMaterialModal(true);
  };

  const handleMaterialSelect = (material) => {
    setShowMaterialModal(false);
    handleMaterialSelection(material);
  };

  const handleMaterialSelection = (material) => {
    setSelectedMaterial(material);
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

  // Модальное окно выбора материала
  const renderMaterialModal = () => {
    if (!showMaterialModal) return null;
    
    return (
      <Modal
        visible={showMaterialModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMaterialModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>
                Выберите материал слоя
              </Text>
              <Text style={[styles.modalSubtitle, { color: currentColors.constantText }]}>
                Выберите из базы данных или введите вручную
              </Text>
            </View>
            
            <ScrollView style={styles.materialList}>
              {materials.map((material) => (
                <TouchableOpacity
                  key={material.id}
                  style={[
                    styles.materialItem,
                    { 
                      borderColor: currentColors.inputBorder,
                      backgroundColor: currentColors.inputBackground 
                    }
                  ]}
                  onPress={() => handleMaterialSelect(material)}
                >
                  <Text style={[styles.materialName, { color: currentColors.primary }]}>
                    {material.material_type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.manualInputButton, { backgroundColor: currentColors.inputBackground }]}
              onPress={handleManualInput}
            >
              <Text style={[styles.manualInputText, { color: currentColors.text }]}>
                ✏️ Ручной ввод
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: currentColors.inputBackground }]}
              onPress={() => setShowMaterialModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: currentColors.text }]}>
                Отмена
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.layerContainer, { borderColor: currentColors.inputBorder }]}>
      {renderMaterialModal()}
      
      <TouchableOpacity
        style={[styles.layerHeader, { backgroundColor: currentColors.inputBackground }]}
        onPress={showMaterialSelection}
      >
        <Text style={[styles.layerTitle, { color: currentColors.text }]}>
          {layer.name || `Слой ${layer.id}`}
        </Text>
        <Text style={[styles.layerSubtitle, { color: currentColors.constantText }]}>
          {selectedMaterial ? `📁 ${selectedMaterial.material_type}` : '✏️ Ручной ввод'}
        </Text>
      </TouchableOpacity>

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
  // Модальное окно
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'IBM-Plex-Mono-Bold',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  materialList: {
    maxHeight: 400,
    marginBottom: 15,
  },
  materialItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  materialName: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Bold',
    fontWeight: 'bold',
  },
  manualInputButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  manualInputText: {
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '600',
  },
  modalCancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '600',
  },
});

export default LayerSelection;