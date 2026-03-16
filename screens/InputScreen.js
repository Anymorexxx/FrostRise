import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, Switch, Modal, SafeAreaView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors';
import { DatabaseService } from '../database/database';
import LayerSelection from '../components/LayerSelection';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const InputScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;

  const [selectedIGE, setSelectedIGE] = useState('');
  const [selectedIGEName, setSelectedIGEName] = useState('');
  const [lambdaF, setLambdaF] = useState('');
  const [cF, setCf] = useState('');
  const [t0, setT0] = useState('');
  const [pd, setPd] = useState('');
  const [w, setW] = useState('');
  const [wp, setWp] = useState('');
  const [ip, setIp] = useState('');
  const [subsoilName, setSubsoilName] = useState('');
  const [tcp, setTcp] = useState('');
  const [tf, setTf] = useState('');
  const [layers, setLayers] = useState([
    { id: 1, name: 'Слой 1', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
    { id: 2, name: 'Слой 2', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
    { id: 3, name: 'Слой 3', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
    { id: 4, name: 'Слой 4', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
    { id: 5, name: 'Слой 5', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' }
  ]);
  const [insulationEnabled, setInsulationEnabled] = useState(false);
  const [soils, setSoils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSoilModal, setShowSoilModal] = useState(false);

  useEffect(() => {
    const loadData = async () => { await loadSoilsFromDB(); };
    loadData();
  }, []);

  const loadSoilsFromDB = async () => {
    try {
      const soilsData = await DatabaseService.getAllSoils();
      setSoils(soilsData);
    } catch (error) {
      setSoils(getFallbackSoils());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackSoils = () => {
    return [
      { code: '11_1', name: 'Песок гравелистый', lambda_f: 2.1, c_f: 2100, t0: 0 },
      { code: '11_2', name: 'Песок мелкий', lambda_f: 1.8, c_f: 1800, t0: 0.2 },
      { code: '12_1', name: 'Супесь', lambda_f: 1.5, c_f: 1700, t0: 0.4 },
    ];
  };

  const showIGESelection = () => {
    if (!soils || soils.length === 0) {
      Alert.alert('Ошибка', 'Данные грунтов не загружены');
      return;
    }
    setShowSoilModal(true);
  };

  const handleSoilSelect = (selected) => {
    setShowSoilModal(false);
    handleSoilSelection(selected);
  };

  const handleSoilSelection = (selected) => {
    if (!selected) return;
    setSelectedIGE(selected.code);
    setSelectedIGEName(`${selected.code} - ${selected.name}`);
    setLambdaF(selected.lambda_f?.toString() || '');
    setCf(selected.c_f?.toString() || '');
    setT0(selected.t0?.toString() || '');
    setSubsoilName(selected.name);
    setPd(selected.rho_d?.toString() || '1800');
    setW(selected.w?.toString() || '0.21');
    setWp(selected.wp?.toString() || '0.18');
    setIp(selected.ip?.toString() || '0.16');
  };

  const updateLayer = (layerId, updates) => {
    setLayers(prevLayers =>
      prevLayers.map(layer => layer.id === layerId ? { ...layer, ...updates } : layer)
    );
  };

  const isFormValid = () => {
    if (!selectedIGE) return false;
    const soilFields = [pd, w, wp, ip, t0];
    if (!soilFields.every(field => field && field.toString().trim() !== '')) return false;
    if (!tcp || !tf) return false;
    const hasValidLayer = layers.some(layer => layer.thickness && layer.density && layer.moisture);
    return hasValidLayer;
  };

  const handleCalculate = () => {
    if (!isFormValid()) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля и хотя бы один расчетный слой');
      return;
    }
    const soilNumericFields = [
      { value: pd, name: 'Плотность сухого грунта' },
      { value: w, name: 'Влажность грунта' },
      { value: wp, name: 'Влажность на границе раскатывания' },
      { value: ip, name: 'Число пластичности' },
      { value: t0, name: 't0' },
      { value: tcp, name: 'Средняя температура' },
      { value: tf, name: 'Продолжительность периода отрицательных температур' }
    ];
    for (let field of soilNumericFields) {
      const value = parseFloat(field.value);
      if (isNaN(value)) { Alert.alert('Ошибка', `Поле "${field.name}" должно быть числом`); return; }
      if (value < 0) { Alert.alert('Ошибка', `Поле "${field.name}" должно быть положительным числом`); return; }
    }
    if (parseFloat(w) > 1 || parseFloat(wp) > 1) {
      Alert.alert('Ошибка', 'Влажность должна быть в диапазоне 0-1');
      return;
    }
    for (let layer of layers) {
      if (layer.thickness || layer.density || layer.moisture) {
        const layerFields = [
          { value: layer.thickness, name: `Толщина слоя ${layer.id}` },
          { value: layer.density, name: `Плотность слоя ${layer.id}` },
          { value: layer.moisture, name: `Влажность слоя ${layer.id}` },
          { value: layer.lambdaF, name: `λf слоя ${layer.id}` },
          { value: layer.cF, name: `Cf слоя ${layer.id}` }
        ];
        for (let field of layerFields) {
          if (field.value && field.value.toString().trim() !== '') {
            const value = parseFloat(field.value);
            if (isNaN(value)) { Alert.alert('Ошибка', `Поле "${field.name}" должно быть числом`); return; }
            if (value < 0) { Alert.alert('Ошибка', `Поле "${field.name}" должно быть положительным числом`); return; }
          }
        }
        if (parseFloat(layer.moisture) > 1) {
          Alert.alert('Ошибка', `Влажность слоя ${layer.id} должна быть в диапазоне 0-1`);
          return;
        }
      }
    }
    const filledLayers = layers
      .filter(layer => layer.thickness && layer.density && layer.moisture)
      .map(layer => ({
        ...layer,
        lambdaF: layer.lambdaF || lambdaF,
        cF: layer.cF || cF
      }));
    if (filledLayers.length === 0) {
      Alert.alert('Ошибка', 'Заполните хотя бы один расчетный слой');
      return;
    }
    navigation.navigate('Result', {
      inputData: {
        selectedIGE,
        soilData: { lambdaF, cF, t0, pd, w, wp, ip, subsoilName },
        layers: filledLayers,
        climateData: { tcp, tf },
        insulationEnabled
      },
    });
  };

  const clearForm = () => {
    setSelectedIGE(''); setSelectedIGEName(''); setLambdaF(''); setCf(''); setT0(''); setPd(''); setW(''); setWp(''); setIp(''); setSubsoilName(''); setTcp(''); setTf('');
    setLayers([
      { id: 1, name: 'Слой 1', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
      { id: 2, name: 'Слой 2', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
      { id: 3, name: 'Слой 3', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
      { id: 4, name: 'Слой 4', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
      { id: 5, name: 'Слой 5', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' }
    ]);
    setInsulationEnabled(false);
  };

  const renderSoilModal = () => {
    if (!showSoilModal) return null;
    return (
      <Modal visible={showSoilModal} transparent={true} animationType="fade" onRequestClose={() => setShowSoilModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>Выберите ИГЭ</Text>
              <Text style={[styles.modalSubtitle, { color: currentColors.constantText }]}>Выберите тип грунта из списка</Text>
            </View>
            <ScrollView style={styles.soilList}>
              {soils.map((soil) => (
                <TouchableOpacity
                  key={soil.code}
                  style={[styles.soilItem, { borderColor: currentColors.inputBorder, backgroundColor: currentColors.cardBackground }]}
                  onPress={() => handleSoilSelect(soil)}
                >
                  <Text style={[styles.soilCode, { color: currentColors.primaryButton }]}>{soil.code}</Text>
                  <Text style={[styles.soilName, { color: currentColors.text }]}>{soil.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: currentColors.inputBackground }]}
              onPress={() => setShowSoilModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: currentColors.text }]}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: currentColors.text, fontFamily: 'IBM-Plex-Mono' }}>Загрузка данных грунтов...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {renderSoilModal()}

        <View style={[styles.card, { backgroundColor: currentColors.cardBackground, shadowColor: currentColors.cardShadow }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="earth" size={24} color={currentColors.iconColor} style={styles.sectionIcon} />
            <View>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Грунт основания</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.igeSelectionButton, { 
              backgroundColor: currentColors.inputBackground, 
              borderColor: selectedIGE ? currentColors.primaryButton : currentColors.inputBorder,
              borderWidth: selectedIGE ? 1.5 : 1
            }]}
            onPress={showIGESelection}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons 
                name={selectedIGE ? "checkmark-circle" : "search-outline"} 
                size={20} 
                color={selectedIGE ? currentColors.primaryButton : currentColors.constantText} 
                style={{ marginRight: 10 }} 
              />
              <Text style={[styles.igeSelectionText, { 
                color: selectedIGE ? currentColors.text : currentColors.constantText,
                flexShrink: 1
              }]} numberOfLines={1}>
                {selectedIGE ? selectedIGEName : 'Нажмите для выбора ИГЭ...'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={currentColors.constantText} style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {selectedIGE && (
            <View style={[styles.soilPropertiesContainer, { backgroundColor: currentColors.background }]}>
              {Object.entries({ 'λf, Вт/(м·°C)': lambdaF, 'Cf, кДж/(м³·°C)': cF, 't0, °C': t0, 'ρd, кг/м³': pd, 'W, д.е.': w, 'Wp, д.е.': wp, 'Jp, д.е.': ip }).map(([key, val]) => (
                <View key={key} style={styles.constantRow}>
                  <Text style={[styles.constantLabel, { color: currentColors.constantText }]}>{key.split(',')[0]}</Text>
                  <Text style={[styles.constantValue, { color: currentColors.text }]}>{val} <Text style={{ fontSize: 12, color: currentColors.constantText }}>{key.split(',')[1]}</Text></Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: currentColors.cardBackground, shadowColor: currentColors.cardShadow }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="layers" size={24} color={currentColors.iconColor} style={styles.sectionIcon} />
            <View>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Конструктивные слои</Text>
            </View>
          </View>
          {layers.map((layer) => (
            <LayerSelection key={layer.id} layer={layer} onUpdate={updateLayer} soilLambdaF={lambdaF} soilCF={cF} />
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: currentColors.cardBackground, shadowColor: currentColors.cardShadow }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="thermometer" size={24} color={currentColors.iconColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Климатические параметры</Text>
          </View>
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Средняя температура Tcp (°C)</Text>
            <TextInput
              style={[styles.inputField, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.inputBorder, color: currentColors.text }]}
              value={tcp} onChangeText={setTcp} keyboardType="decimal-pad" placeholder="12.51" placeholderTextColor={currentColors.constantText}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Продолжительность Tf (час)</Text>
            <TextInput
              style={[styles.inputField, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.inputBorder, color: currentColors.text }]}
              value={tf} onChangeText={setTf} keyboardType="decimal-pad" placeholder="3624" placeholderTextColor={currentColors.constantText}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: currentColors.cardBackground, shadowColor: currentColors.cardShadow }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color={currentColors.iconColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Дополнительно</Text>
          </View>
          <View style={styles.insulationContainer}>
            <Text style={[styles.insulationLabel, { color: currentColors.inputText }]}>Использовать утеплитель</Text>
            <Switch value={insulationEnabled} onValueChange={setInsulationEnabled} disabled={true} trackColor={{ false: currentColors.inputBorder, true: currentColors.primaryButton }} />
          </View>
          <Text style={[styles.insulationNote, { color: currentColors.constantText }]}>Временно недоступно</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.calculateButton, { backgroundColor: isFormValid() ? currentColors.primaryButton : currentColors.secondaryButton, shadowColor: currentColors.primaryButton }]}
            onPress={handleCalculate} disabled={!isFormValid()} activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Рассчитать Результат</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.clearButton, { borderColor: currentColors.inputBorder }]} onPress={clearForm}>
            <Ionicons name="trash-outline" size={18} color={currentColors.text} style={{ marginRight: 8 }} />
            <Text style={[styles.clearButtonText, { color: currentColors.text }]}>Очистить форму</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionIcon: { marginRight: 12 },
  sectionTitle: { fontSize: 18, fontFamily: 'IBM-Plex-Mono-Bold' },
  sectionSubtitle: { fontSize: 12, fontFamily: 'IBM-Plex-Mono', marginTop: 2 },
  igeSelectionButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  igeSelectionText: { fontSize: 16, fontFamily: 'IBM-Plex-Mono' },
  soilPropertiesContainer: { marginTop: 16, padding: 16, borderRadius: 12 },
  constantRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)' },
  constantLabel: { fontSize: 14, fontFamily: 'IBM-Plex-Mono' },
  constantValue: { fontSize: 14, fontFamily: 'IBM-Plex-Mono-Bold' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' },
  inputLabel: { fontSize: 14, fontFamily: 'IBM-Plex-Mono', flex: 1, paddingRight: 10 },
  inputField: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, fontFamily: 'IBM-Plex-Mono', fontSize: 14, flex: 1 },
  insulationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  insulationLabel: { fontSize: 14, fontFamily: 'IBM-Plex-Mono' },
  insulationNote: { fontSize: 12, fontFamily: 'IBM-Plex-Mono', fontStyle: 'italic', opacity: 0.7 },
  buttonContainer: { marginTop: 16 },
  calculateButton: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 16, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  buttonText: { fontSize: 18, color: '#FFF', fontFamily: 'IBM-Plex-Mono-Bold' },
  clearButton: { flexDirection: 'row', paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  clearButtonText: { fontSize: 16, fontFamily: 'IBM-Plex-Mono' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '80%', borderRadius: 24, padding: 24 },
  modalHeader: { marginBottom: 20 },
  modalTitle: { fontSize: 24, fontFamily: 'IBM-Plex-Mono-Bold', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, fontFamily: 'IBM-Plex-Mono' },
  soilList: { maxHeight: 400, marginBottom: 20 },
  soilItem: { padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  soilCode: { fontSize: 16, fontFamily: 'IBM-Plex-Mono-Bold', marginRight: 12, minWidth: 60 },
  soilName: { fontSize: 14, fontFamily: 'IBM-Plex-Mono', flex: 1 },
  modalCancelButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalCancelText: { fontSize: 16, fontFamily: 'IBM-Plex-Mono-Bold' },
});

export default InputScreen;