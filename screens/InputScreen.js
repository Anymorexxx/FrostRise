// screens/InputScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  ActionSheetIOS,
  Switch,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors.js';
import { DatabaseService } from '../database/database';
import LayerSelection from '../components/LayerSelection';

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
  
  // Климатические параметры
  const [tcp, setTcp] = useState('');
  const [tf, setTf] = useState('');
  
  // Расчетные слои (5 слоев)
  const [layers, setLayers] = useState([
    { 
      id: 1, 
      name: 'Слой 1',
      thickness: '',
      density: '',
      moisture: '',
      lambdaF: '',
      cF: ''
    },
    { 
      id: 2, 
      name: 'Слой 2',
      thickness: '',
      density: '',
      moisture: '',
      lambdaF: '',
      cF: ''
    },
    { 
      id: 3, 
      name: 'Слой 3',
      thickness: '',
      density: '',
      moisture: '',
      lambdaF: '',
      cF: ''
    },
    { 
      id: 4, 
      name: 'Слой 4',
      thickness: '',
      density: '',
      moisture: '',
      lambdaF: '',
      cF: ''
    },
    { 
      id: 5, 
      name: 'Слой 5',
      thickness: '',
      density: '',
      moisture: '',
      lambdaF: '',
      cF: ''
    }
  ]);

  // Утеплитель (пока выключен)
  const [insulationEnabled, setInsulationEnabled] = useState(false);

  const [soils, setSoils] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка данных грунтов из БД при монтировании
  useEffect(() => {
    const loadData = async () => {
      await loadSoilsFromDB();
    };
    loadData();
  }, []);

  const loadSoilsFromDB = async () => {
    try {
      console.log('Loading soils from DB...');
      const soilsData = await DatabaseService.getAllSoils();
      setSoils(soilsData);
      console.log('Soils loaded successfully:', soilsData.length);
    } catch (error) {
      console.error('Error loading soils from DB:', error);
      setSoils(getFallbackSoils());
    } finally {
      setLoading(false);
    }
  };

  const showIGESelection = () => {
    if (!soils || soils.length === 0) {
      Alert.alert('Ошибка', 'Данные грунтов не загружены');
      return;
    }

    try {
      const options = ['Отмена', ...soils.map(soil => `${soil.code} - ${soil.name}`)];
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options,
          cancelButtonIndex: 0,
          title: 'Выберите ИГЭ',
          message: 'Выберите тип грунта из списка',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            return;
          }
          const selectedIndex = buttonIndex - 1;
          const selected = soils[selectedIndex];
          if (selected) {
            handleSoilSelection(selected);
          }
        }
      );
    } catch (error) {
      console.error('Error showing soil selection:', error);
      Alert.alert('Ошибка', 'Не удалось открыть выбор грунта');
    }
  };

  const handleSoilSelection = (selected) => {
    if (!selected) return;
    
    setSelectedIGE(selected.code);
    setSelectedIGEName(`${selected.code} - ${selected.name}`);
    setLambdaF(selected.lambda_f?.toString() || '');
    setCf(selected.c_f?.toString() || '');
    setT0(selected.t0?.toString() || '');
    setSubsoilName(selected.name);
    
    // Устанавливаем значения по умолчанию для грунта из данных БД
    setPd(selected.rho_d?.toString() || '1800');
    setW(selected.w?.toString() || '0.21');
    setWp(selected.wp?.toString() || '0.18');
    setIp(selected.ip?.toString() || '0.16');
  };

  const updateLayer = (layerId, updates) => {
    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    );
  };

  const isFormValid = () => {
    // Проверяем выбор ИГЭ
    if (!selectedIGE) return false;

    // Проверяем обязательные поля грунта
    const soilFields = [pd, w, wp, ip, t0];
    if (!soilFields.every(field => field && field.toString().trim() !== '')) {
      return false;
    }

    // Проверяем климатические параметры
    if (!tcp || !tf) return false;

    // Проверяем, что хотя бы один слой заполнен
    const hasValidLayer = layers.some(layer => 
      layer.thickness && layer.density && layer.moisture
    );

    return hasValidLayer;
  };

  const handleCalculate = () => {
    if (!isFormValid()) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля и хотя бы один расчетный слой');
      return;
    }

    // Валидация числовых значений грунта
    const soilNumericFields = [
      { value: pd, name: 'Плотность сухого грунта' },
      { value: w, name: 'Влажность грунта' },
      { value: wp, name: 'Влажность на границе раскатывания' },
      { value: ip, name: 'Число пластичности' },
      { value: t0, name: 't0' },
      { value: tcp, name: 'Средняя температура' },
      { value: tf, name: 'Продолжительность промерзания' }
    ];

    for (let field of soilNumericFields) {
      const value = parseFloat(field.value);
      if (isNaN(value)) {
        Alert.alert('Ошибка', `Поле "${field.name}" должно быть числом`);
        return;
      }
      if (value < 0) {
        Alert.alert('Ошибка', `Поле "${field.name}" должно быть положительным числом`);
        return;
      }
    }

    // Валидация влажности
    if (parseFloat(w) > 1 || parseFloat(wp) > 1) {
      Alert.alert('Ошибка', 'Влажность должна быть в диапазоне 0-1');
      return;
    }

    // Валидация расчетных слоев
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
          // Проверяем только заполненные поля
          if (field.value && field.value.toString().trim() !== '') {
            const value = parseFloat(field.value);
            if (isNaN(value)) {
              Alert.alert('Ошибка', `Поле "${field.name}" должно быть числом`);
              return;
            }
            if (value < 0) {
              Alert.alert('Ошибка', `Поле "${field.name}" должно быть положительным числом`);
              return;
            }
          }
        }

        if (parseFloat(layer.moisture) > 1) {
          Alert.alert('Ошибка', `Влажность слоя ${layer.id} должна быть в диапазоне 0-1`);
          return;
        }
      }
    }

    // Фильтруем только заполненные слои и устанавливаем значения по умолчанию для пустых полей
    const filledLayers = layers
      .filter(layer => layer.thickness && layer.density && layer.moisture)
      .map(layer => ({
        ...layer,
        // Если lambdaF или cF не заполнены, используем значения из грунта
        lambdaF: layer.lambdaF || lambdaF,
        cF: layer.cF || cF
      }));

    if (filledLayers.length === 0) {
      Alert.alert('Ошибка', 'Заполните хотя бы один расчетный слой');
      return;
    }

    // Передача данных на экран результатов
    navigation.navigate('Result', {
      inputData: {
        selectedIGE,
        soilData: {
          lambdaF,
          cF,
          t0,
          pd,
          w,
          wp,
          ip,
          subsoilName
        },
        layers: filledLayers,
        climateData: {
          tcp,
          tf
        },
        insulationEnabled
      },
    });
  };

  const clearForm = () => {
    setSelectedIGE('');
    setSelectedIGEName('');
    setLambdaF('');
    setCf('');
    setT0('');
    setPd('');
    setW('');
    setWp('');
    setIp('');
    setSubsoilName('');
    setTcp('');
    setTf('');
    setLayers([
      { id: 1, name: 'Слой 1', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
      { id: 2, name: 'Слой 2', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
      { id: 3, name: 'Слой 3', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
      { id: 4, name: 'Слой 4', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' },
      { id: 5, name: 'Слой 5', thickness: '', density: '', moisture: '', lambdaF: '', cF: '' }
    ]);
    setInsulationEnabled(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: currentColors.text }]}>
            Загрузка данных грунтов...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentColors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Кнопка выбора ИГЭ */}
      <View style={styles.igeSelectionContainer}>
        <TouchableOpacity 
          style={[styles.igeSelectionButton, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder 
          }]}
          onPress={showIGESelection}
        >
          <Text style={[styles.igeSelectionText, { color: currentColors.text }]}>
            {selectedIGE ? selectedIGEName : 'Выберите ИГЭ...'}
          </Text>
          <Text style={[styles.igeSelectionArrow, { color: currentColors.constantText }]}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Характеристики грунта (только для чтения) */}
      {selectedIGE ? (
        <View style={styles.soilPropertiesContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.sectionTitle }]}>
            Характеристики грунта (из БД)
          </Text>
          
          <View style={styles.constantRow}>
            <Text style={[styles.constantLabel, { color: currentColors.constantText }]}>λf:</Text>
            <View style={styles.constantValueContainer}>
              <Text style={[styles.constantValue, { color: currentColors.constantText }]}>{lambdaF}</Text>
              <Text style={[styles.constantUnit, { color: currentColors.constantText }]}>Вт/(м·°C)</Text>
            </View>
          </View>

          <View style={styles.constantRow}>
            <Text style={[styles.constantLabel, { color: currentColors.constantText }]}>Cf:</Text>
            <View style={styles.constantValueContainer}>
              <Text style={[styles.constantValue, { color: currentColors.constantText }]}>{cF}</Text>
              <Text style={[styles.constantUnit, { color: currentColors.constantText }]}>кДж/(м³·°C)</Text>
            </View>
          </View>

          <View style={styles.constantRow}>
            <Text style={[styles.constantLabel, { color: currentColors.constantText }]}>t0:</Text>
            <View style={styles.constantValueContainer}>
              <Text style={[styles.constantValue, { color: currentColors.constantText }]}>{t0}</Text>
              <Text style={[styles.constantUnit, { color: currentColors.constantText }]}>°C</Text>
            </View>
          </View>

          <View style={styles.constantRow}>
            <Text style={[styles.constantLabel, { color: currentColors.constantText }]}>ρd:</Text>
            <View style={styles.constantValueContainer}>
              <Text style={[styles.constantValue, { color: currentColors.constantText }]}>{pd}</Text>
              <Text style={[styles.constantUnit, { color: currentColors.constantText }]}>кг/м³</Text>
            </View>
          </View>

          <View style={styles.constantRow}>
            <Text style={[styles.constantLabel, { color: currentColors.constantText }]}>W:</Text>
            <View style={styles.constantValueContainer}>
              <Text style={[styles.constantValue, { color: currentColors.constantText }]}>{w}</Text>
              <Text style={[styles.constantUnit, { color: currentColors.constantText }]}>д.е.</Text>
            </View>
          </View>

          <View style={styles.constantRow}>
            <Text style={[styles.constantLabel, { color: currentColors.constantText }]}>Wp:</Text>
            <View style={styles.constantValueContainer}>
              <Text style={[styles.constantValue, { color: currentColors.constantText }]}>{wp}</Text>
              <Text style={[styles.constantUnit, { color: currentColors.constantText }]}>д.е.</Text>
            </View>
          </View>

          <View style={styles.constantRow}>
            <Text style={[styles.constantLabel, { color: currentColors.constantText }]}>Jp:</Text>
            <View style={styles.constantValueContainer}>
              <Text style={[styles.constantValue, { color: currentColors.constantText }]}>{ip}</Text>
              <Text style={[styles.constantUnit, { color: currentColors.constantText }]}>д.е.</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noSelectionContainer}>
          <Text style={[styles.noSelectionText, { color: currentColors.constantText }]}>
            Выберите тип грунта для отображения характеристик
          </Text>
        </View>
      )}

      {/* Расчетные слои с новым компонентом выбора */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentColors.sectionTitle }]}>
          Расчетные слои (5 слоев)
        </Text>
        <Text style={[styles.sectionSubtitle, { color: currentColors.inputText }]}>
          Нажмите на название слоя для выбора материала из БД или ручного ввода
        </Text>
      </View>

      {layers.map((layer) => (
        <LayerSelection
          key={layer.id}
          layer={layer}
          onUpdate={updateLayer}
          soilLambdaF={lambdaF}
          soilCF={cF}
        />
      ))}

      {/* Утеплитель (выключен) */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentColors.sectionTitle }]}>
          Утеплитель
        </Text>
      </View>
      
      <View style={styles.insulationContainer}>
        <Text style={[styles.insulationLabel, { color: currentColors.inputText }]}>
          Использовать утеплитель
        </Text>
        <Switch
          value={insulationEnabled}
          onValueChange={setInsulationEnabled}
          disabled={true}
          trackColor={{ false: currentColors.inputBorder, true: currentColors.primaryButton }}
        />
      </View>
      <Text style={[styles.insulationNote, { color: currentColors.constantText }]}>
        Модуль утеплителя будет доступен в следующем обновлении
      </Text>

      {/* Климатические параметры */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentColors.sectionTitle }]}>
          Климатические параметры
        </Text>
      </View>

      <View style={styles.inputRow}>
        <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Средняя температура Tcp (°C)</Text>
        <TextInput
          style={[styles.inputField, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder,
            color: currentColors.text 
          }]}
          value={tcp}
          onChangeText={setTcp}
          keyboardType="decimal-pad"
          placeholder="12.51"
          placeholderTextColor={currentColors.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={[styles.inputLabel, { color: currentColors.inputText }]}>Продолжительность промерзания Tf (час)</Text>
        <TextInput
          style={[styles.inputField, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder,
            color: currentColors.text 
          }]}
          value={tf}
          onChangeText={setTf}
          keyboardType="decimal-pad"
          placeholder="3624"
          placeholderTextColor={currentColors.inputText}
        />
      </View>

      {/* Кнопки действий */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.calculateButton,
            { 
              backgroundColor: isFormValid() ? currentColors.primaryButton : currentColors.secondaryButton 
            },
          ]}
          onPress={handleCalculate}
          disabled={!isFormValid()}
        >
          <Text style={[styles.buttonText, { color: currentColors.text }]}>Рассчитать Hₙ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.clearButton, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder
          }]}
          onPress={clearForm}
        >
          <Text style={[styles.clearButtonText, { color: currentColors.text }]}>Очистить форму</Text>
        </TouchableOpacity>
      </View>

      {/* Ссылка на историю */}
      <TouchableOpacity onPress={() => navigation.navigate('History')}>
        <Text style={[styles.historyLink, { color: currentColors.historyLink }]}>История расчётов</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  noSelectionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  noSelectionText: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontStyle: 'italic',
  },
  igeSelectionContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  igeSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  igeSelectionText: {
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono-Regular',
    flex: 1,
  },
  igeSelectionArrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  soilPropertiesContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    marginTop: 4,
  },
  constantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  constantLabel: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '500',
    flex: 1,
  },
  constantValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  constantValue: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
    marginRight: 8,
    fontWeight: '500',
  },
  constantUnit: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    opacity: 0.8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  insulationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  insulationLabel: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  insulationNote: {
    fontSize: 11,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 25,
  },
  calculateButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  clearButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  historyLink: {
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontSize: 16,
  },
});

export default InputScreen;