// InputScreen.js
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import colors from '../constants/colors.js';

const InputScreen = ({ navigation }) => {
  const [selectedIGE, setSelectedIGE] = useState('');
  const [selectedIGEName, setSelectedIGEName] = useState('');
  const [lambdaF, setLambdaF] = useState('');
  const [cF, setCf] = useState('');
  const [thickness, setThickness] = useState('');
  const [density, setDensity] = useState('');
  const [moisture, setMoisture] = useState('');
  const [subsoilName, setSubsoilName] = useState('');
  const [t0, setT0] = useState('');
  const [pd, setPd] = useState('');
  const [w, setW] = useState('');
  const [wp, setWp] = useState('');
  const [ip, setIp] = useState('');
  const [tcp, setTcp] = useState('');
  const [tf, setTf] = useState('');

  // Пример данных для IGE (в реальном проекте — из SQLite)
  const iges = [
    { code: '11_1', name: 'Песок гравелистый и крупный', lambdaF: 2.1, cF: 2100, t0: 0.0 },
    { code: '11_2', name: 'Песок мелкий и пылеватый', lambdaF: 1.8, cF: 1800, t0: 0.2 },
    { code: '12_1', name: 'Супесь легкая', lambdaF: 1.5, cF: 1700, t0: 0.4 },
    { code: '12_2', name: 'Супесь тяжелая', lambdaF: 1.4, cF: 1600, t0: 0.5 },
    { code: '13_1', name: 'Суглинок легкий', lambdaF: 1.3, cF: 1500, t0: 0.6 },
    { code: '13_2', name: 'Суглинок тяжелый', lambdaF: 1.2, cF: 1400, t0: 0.7 },
    { code: '14_1', name: 'Глина легкая', lambdaF: 1.1, cF: 1300, t0: 0.8 },
    { code: '14_2', name: 'Глина тяжелая', lambdaF: 1.0, cF: 1200, t0: 0.9 },
  ];

  const showIGESelection = () => {
    const options = ['Отмена', ...iges.map(ige => `${ige.code} - ${ige.name}`)];
    
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: options,
        cancelButtonIndex: 0,
        title: 'Выберите ИГЭ',
        message: 'Выберите тип грунта из списка',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // Отмена
          return;
        }
        const selectedIndex = buttonIndex - 1;
        const selected = iges[selectedIndex];
        setSelectedIGE(selected.code);
        setSelectedIGEName(`${selected.code} - ${selected.name}`);
        setLambdaF(selected.lambdaF.toString());
        setCf(selected.cF.toString());
        setT0(selected.t0.toString());
      }
    );
  };

  useEffect(() => {
    if (!selectedIGE) {
      // Сбрасываем константы при отсутствии выбора
      setLambdaF('');
      setCf('');
      setT0('');
    }
  }, [selectedIGE]);

  const isFormValid = () => {
    return (
      selectedIGE &&
      thickness &&
      density &&
      moisture &&
      subsoilName &&
      t0 &&
      pd &&
      w &&
      wp &&
      ip &&
      tcp &&
      tf
    );
  };

  const handleCalculate = () => {
    if (!isFormValid()) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    // Передача данных на экран результатов
    navigation.navigate('Result', {
      inputData: {
        selectedIGE,
        lambdaF,
        cF,
        thickness,
        density,
        moisture,
        subsoilName,
        t0,
        pd,
        w,
        wp,
        ip,
        tcp,
        tf,
      },
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Кнопка выбора ИГЭ в стиле iOS */}
      <View style={styles.igeSelectionContainer}>
        <TouchableOpacity 
          style={styles.igeSelectionButton}
          onPress={showIGESelection}
        >
          <Text style={styles.igeSelectionText}>
            {selectedIGE ? selectedIGEName : 'Выберите ИГЭ...'}
          </Text>
          <Text style={styles.igeSelectionArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Константы появляются только при выбранном ИГЭ */}
      {selectedIGE ? (
        <>
          {/* λf с единицами измерения */}
          <View style={styles.constantRow}>
            <Text style={[styles.constantLabel, styles.constantText]}>λf:</Text>
            <View style={styles.constantValueContainer}>
              <Text style={styles.constantValue}>{lambdaF}</Text>
              <Text style={styles.constantUnit}>Вт/(м·°C)</Text>
            </View>
          </View>

          {/* Cf с единицами измерения */}
          <View style={styles.constantRow}>
            <Text style={[styles.constantLabel, styles.constantText]}>Cf:</Text>
            <View style={styles.constantValueContainer}>
              <Text style={styles.constantValue}>{cF}</Text>
              <Text style={styles.constantUnit}>кДж/(м³·°C)</Text>
            </View>
          </View>
        </>
      ) : null}

      {/* Редактируемые поля - горизонтальное расположение */}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Толщина (м)</Text>
        <TextInput
          style={styles.inputField}
          value={thickness}
          onChangeText={setThickness}
          keyboardType="decimal-pad"
          placeholder="Введите толщину"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Плотность (кг/м³)</Text>
        <TextInput
          style={styles.inputField}
          value={density}
          onChangeText={setDensity}
          keyboardType="decimal-pad"
          placeholder="Введите плотность"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Влажность W (д.е.)</Text>
        <TextInput
          style={styles.inputField}
          value={moisture}
          onChangeText={setMoisture}
          keyboardType="decimal-pad"
          placeholder="Введите влажность"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Название подстилающего грунта</Text>
        <TextInput
          style={styles.inputField}
          value={subsoilName}
          onChangeText={setSubsoilName}
          placeholder="Введите название грунта"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>t0 (°C)</Text>
        <TextInput
          style={styles.inputField}
          value={t0}
          onChangeText={setT0}
          keyboardType="decimal-pad"
          placeholder="Введите температуру"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>pd (кг/м³)</Text>
        <TextInput
          style={styles.inputField}
          value={pd}
          onChangeText={setPd}
          keyboardType="decimal-pad"
          placeholder="Введите плотность сухого грунта"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>W (д.е.)</Text>
        <TextInput
          style={styles.inputField}
          value={w}
          onChangeText={setW}
          keyboardType="decimal-pad"
          placeholder="Введите влажность"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Wp</Text>
        <TextInput
          style={styles.inputField}
          value={wp}
          onChangeText={setWp}
          keyboardType="decimal-pad"
          placeholder="Введите Wp"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Jp</Text>
        <TextInput
          style={styles.inputField}
          value={ip}
          onChangeText={setIp}
          keyboardType="decimal-pad"
          placeholder="Введите Jp"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Tcp (°C)</Text>
        <TextInput
          style={styles.inputField}
          value={tcp}
          onChangeText={setTcp}
          keyboardType="decimal-pad"
          placeholder="Введите среднюю температуру"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Tf</Text>
        <TextInput
          style={styles.inputField}
          value={tf}
          onChangeText={setTf}
          keyboardType="decimal-pad"
          placeholder="Введите Tf"
          placeholderTextColor={colors.light.inputText}
        />
      </View>

      {/* Кнопка "Рассчитать" */}
      <TouchableOpacity
        style={[
          styles.calculateButton,
          { backgroundColor: isFormValid() ? colors.light.primaryButton : colors.light.secondaryButton },
        ]}
        onPress={handleCalculate}
        disabled={!isFormValid()}
      >
        <Text style={styles.buttonText}>Рассчитать</Text>
      </TouchableOpacity>

      {/* Ссылка на историю */}
      <TouchableOpacity onPress={() => navigation.navigate('History')}>
        <Text style={styles.historyLink}>История расчётов</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  // Стили для выбора ИГЭ в стиле iOS
  igeSelectionContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  igeSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light.inputBackground,
    borderWidth: 1,
    borderColor: colors.light.inputBorder,
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
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Regular',
    flex: 1,
  },
  igeSelectionArrow: {
    fontSize: 12,
    color: colors.light.constantText,
    marginLeft: 8,
  },
  // Стили для констант
  constantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
  },
  constantLabel: {
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '500',
    flex: 1,
  },
  constantText: {
    color: colors.light.constantText,
  },
  constantValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  constantValue: {
    fontSize: 16,
    color: colors.light.constantText,
    fontFamily: 'IBM-Plex-Mono-Regular',
    marginRight: 8,
    fontWeight: '500',
  },
  constantUnit: {
    fontSize: 14,
    color: colors.light.constantText,
    fontFamily: 'IBM-Plex-Mono-Regular',
    opacity: 0.8,
  },
  // Стили для редактируемых полей (горизонтальное расположение)
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 16,
    color: colors.light.inputText,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '500',
    flex: 1,
  },
  inputField: {
    height: 44,
    backgroundColor: colors.light.inputBackground,
    borderWidth: 1,
    borderColor: colors.light.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    color: colors.light.text,
    fontSize: 16,
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
  calculateButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  historyLink: {
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: colors.light.historyLink,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontSize: 16,
  },
});

export default InputScreen;