import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Modal, ScrollView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors';
import { DatabaseService } from '../database/database';
import { Ionicons } from '@expo/vector-icons';

const LayerSelection = ({ layer, onUpdate, soilLambdaF, soilCF }) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;

  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  useEffect(() => { loadMaterials(); }, []);

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
    setShowMaterialModal(false);
    onUpdate(layer.id, {
      name: `Слой ${layer.id}`,
      density: '', moisture: '', lambdaF: '', cF: ''
    });
  };

  const updateField = (field, value) => { onUpdate(layer.id, { [field]: value }); };

  const renderMaterialModal = () => {
    if (!showMaterialModal) return null;
    return (
      <Modal visible={showMaterialModal} transparent={true} animationType="fade" onRequestClose={() => setShowMaterialModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>Выберите материал</Text>
              <Text style={[styles.modalSubtitle, { color: currentColors.constantText }]}>Из базы данных или вручную</Text>
            </View>
            <ScrollView style={styles.materialList}>
              {materials.map((material) => (
                <TouchableOpacity key={material.id} style={[styles.materialItem, { borderColor: currentColors.inputBorder, backgroundColor: currentColors.cardBackground }]} onPress={() => handleMaterialSelect(material)}>
                  <Text style={[styles.materialName, { color: currentColors.primaryButton }]}>{material.material_type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.manualInputButton, { backgroundColor: currentColors.primaryButton }]} onPress={handleManualInput}>
              <Ionicons name="pencil-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.manualInputText}>Ручной ввод</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalCancelButton, { backgroundColor: currentColors.inputBackground }]} onPress={() => setShowMaterialModal(false)}>
              <Text style={[styles.modalCancelText, { color: currentColors.text }]}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.layerContainer, { borderColor: currentColors.inputBorder, backgroundColor: currentColors.cardBackground }]}>
      {renderMaterialModal()}
      <TouchableOpacity style={[styles.layerHeader, { backgroundColor: currentColors.inputBackground }]} onPress={showMaterialSelection} activeOpacity={0.7}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="layers-outline" size={20} color={currentColors.iconColor} style={{ marginRight: 8 }} />
          <Text style={[styles.layerTitle, { color: currentColors.text }]}>{layer.name || `Слой ${layer.id}`}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.layerSubtitle, { color: currentColors.constantText, marginRight: 6 }]}>
            {selectedMaterial ? selectedMaterial.material_type.substring(0, 15) + '...' : 'Изменить'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={currentColors.constantText} />
        </View>
      </TouchableOpacity>

      <View style={styles.inputsWrapper}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Толщина (м)</Text>
          <TextInput style={[styles.inputField, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.inputBorder, color: currentColors.text }]}
            value={layer.thickness} onChangeText={(v) => updateField('thickness', v)} keyboardType="decimal-pad" placeholder="0.20" placeholderTextColor={currentColors.constantText} />
        </View>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Плотность (кг/м³)</Text>
          <TextInput style={[styles.inputField, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.inputBorder, color: currentColors.text }]}
            value={layer.density} onChangeText={(v) => updateField('density', v)} keyboardType="decimal-pad" placeholder="2300" placeholderTextColor={currentColors.constantText} />
        </View>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Влажность (д.е.)</Text>
          <TextInput style={[styles.inputField, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.inputBorder, color: currentColors.text }]}
            value={layer.moisture} onChangeText={(v) => updateField('moisture', v)} keyboardType="decimal-pad" placeholder="0.03" placeholderTextColor={currentColors.constantText} />
        </View>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>λf (Вт/(м·°C))</Text>
          <TextInput style={[styles.inputField, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.inputBorder, color: currentColors.text }]}
            value={layer.lambdaF} onChangeText={(v) => updateField('lambdaF', v)} keyboardType="decimal-pad" placeholder={soilLambdaF || "1.90"} placeholderTextColor={currentColors.constantText} />
        </View>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Cf (кДж/(м³·°C))</Text>
          <TextInput style={[styles.inputField, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.inputBorder, color: currentColors.text }]}
            value={layer.cF} onChangeText={(v) => updateField('cF', v)} keyboardType="decimal-pad" placeholder={soilCF || "1675"} placeholderTextColor={currentColors.constantText} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  layerContainer: { marginBottom: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  layerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  layerTitle: { fontSize: 16, fontFamily: 'IBM-Plex-Mono-Bold' },
  layerSubtitle: { fontSize: 13, fontFamily: 'IBM-Plex-Mono' },
  inputsWrapper: { paddingVertical: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'space-between' },
  inputLabel: { fontSize: 13, fontFamily: 'IBM-Plex-Mono', flex: 1 },
  inputField: { height: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontFamily: 'IBM-Plex-Mono', fontSize: 13, flex: 1.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '80%', borderRadius: 24, padding: 24 },
  modalHeader: { marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: 'IBM-Plex-Mono-Bold', marginBottom: 6 },
  modalSubtitle: { fontSize: 14, fontFamily: 'IBM-Plex-Mono' },
  materialList: { maxHeight: 350, marginBottom: 20 },
  materialItem: { padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 12 },
  materialName: { fontSize: 15, fontFamily: 'IBM-Plex-Mono-Bold' },
  manualInputButton: { flexDirection: 'row', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  manualInputText: { fontSize: 16, fontFamily: 'IBM-Plex-Mono-Bold', color: '#FFF' },
  modalCancelButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 16, fontFamily: 'IBM-Plex-Mono-Bold' }
});

export default LayerSelection;