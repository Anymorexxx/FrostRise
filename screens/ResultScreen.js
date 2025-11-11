// ResultScreen.js
import React, { useEffect, useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors.js';
import { BarChart } from 'react-native-chart-kit';
import { HistoryStorage } from '../utils/historyStorage';
import { generatePDF } from '../utils/pdfGenerator';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { CalculationService } from '../services/calculationService';

const ResultScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;
  
  const { inputData } = route.params;
  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Выполняем расчет при загрузке экрана
  useEffect(() => {
    performCalculation();
  }, []);

  const performCalculation = async () => {
    try {
      setLoading(true);
      const result = await CalculationService.calculateFreezingDepth(inputData);
      setCalculationResult(result);
      
      // Сохраняем в историю
      await HistoryStorage.saveCalculation({
        igE: inputData.selectedIGE,
        df: result.Hn,
        thickness: inputData.thickness,
        density: inputData.density,
        moisture: inputData.moisture,
        subsoilName: inputData.subsoilName,
        riskLevel: result.riskLevel,
      });
      
    } catch (error) {
      console.error('Calculation error:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить расчет');
      // Возвращаемся на предыдущий экран при ошибке
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !calculationResult) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: currentColors.text }]}>
            Выполняется расчет...
          </Text>
        </View>
      </View>
    );
  }

  const { Hn, Hn_TSN, riskLevel, riskColor } = calculationResult;

  const data = {
    labels: ['СП 121.13330', 'ТСН МФ-97 МО'],
    datasets: [
      {
        data: [parseFloat(Hn), parseFloat(Hn_TSN)],
        colors: [(opacity = 1) => currentColors.chart.sp, (opacity = 1) => currentColors.chart.tsn],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: currentColors.inputBackground,
    backgroundGradientTo: currentColors.inputBackground,
    decimalPlaces: 2,
    color: (opacity = 1) => currentColors.text,
    labelColor: (opacity = 1) => currentColors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const handleExport = async () => {
    try {
      const pdfData = {
        date: new Date().toLocaleDateString('ru-RU'),
        inputData: {
          selectedIGE: inputData.selectedIGE || 'Не указан',
          lambdaF: inputData.lambdaF || 'Не указано',
          cF: inputData.cF || 'Не указано',
          thickness: inputData.thickness || 'Не указано',
          density: inputData.density || 'Не указано',
          moisture: inputData.moisture || 'Не указано',
          subsoilName: inputData.subsoilName || 'Не указано',
          t0: inputData.t0 || 'Не указано',
          pd: inputData.pd || 'Не указано',
          w: inputData.w || 'Не указано',
          wp: inputData.wp || 'Не указано',
          ip: inputData.ip || 'Не указано',
          tcp: inputData.tcp || 'Не указано',
          tf: inputData.tf || 'Не указано',
        },
        result: {
          Hn: Hn,
          Hn_TSN: Hn_TSN,
          riskLevel: riskLevel,
        },
        calculationDetails: calculationResult.calculationDetails
      };

      const pdfPath = await generatePDF(pdfData);
      await Sharing.shareAsync(pdfPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Сохранить отчёт FrostRise',
        UTI: 'com.adobe.pdf'
      });

    } catch (error) {
      console.error('PDF Export Error:', error);
      Alert.alert('Ошибка', 'Не удалось создать PDF отчёт');
    }
  };

  const handleNewCalculation = () => {
    navigation.navigate('Input');
  };

  const handleHistory = () => {
    navigation.navigate('History');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentColors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Результат Hn */}
      <View style={[styles.resultBox, { 
        backgroundColor: currentColors.inputBackground,
        borderColor: currentColors.inputBorder 
      }]}>
        <Text style={[styles.resultText, { color: currentColors.text }]}>
          Hn = {Hn} м
        </Text>
        <Text style={[styles.resultSubtext, { color: currentColors.text }]}>
          по методике СП 121.13330.2012
        </Text>
      </View>

      {/* Блок оценки риска */}
      <View style={[styles.riskBox, { backgroundColor: riskColor }]}>
        <Text style={[styles.riskText, { color: currentColors.text }]}>
          {riskLevel}
        </Text>
      </View>

      {/* График сравнения */}
      <View style={styles.chartContainer}>
        <BarChart
          data={data}
          width={300}
          height={200}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero={true}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: currentColors.chart.sp }]} />
            <Text style={[styles.legendText, { color: currentColors.text }]}>
              СП 121.13330
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: currentColors.chart.tsn }]} />
            <Text style={[styles.legendText, { color: currentColors.text }]}>
              ТСН МФ-97 МО
            </Text>
          </View>
        </View>
      </View>

      {/* Детали расчета */}
      <View style={[styles.detailsBox, { 
        backgroundColor: currentColors.inputBackground,
        borderColor: currentColors.inputBorder 
      }]}>
        <Text style={[styles.detailsTitle, { color: currentColors.text }]}>
          Детали расчета:
        </Text>
        <Text style={[styles.detailsText, { color: currentColors.text }]}>
          • Методика: СП 121.13330.2012 формула E.1{'\n'}
          • Сравнение с ТСН МФ-97 МО{'\n'}
          • Учет фазовых переходов тепла
        </Text>
      </View>

      {/* Кнопки */}
      <TouchableOpacity
        style={[styles.exportButton, { backgroundColor: currentColors.exportButton }]}
        onPress={handleExport}
      >
        <Text style={[styles.buttonText, { color: currentColors.text }]}>
          Экспорт в PDF
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.newCalcButton, { backgroundColor: currentColors.primaryButton }]}
        onPress={handleNewCalculation}
      >
        <Text style={[styles.buttonText, { color: currentColors.text }]}>
          Новый расчёт
        </Text>
      </TouchableOpacity>

      {/* Ссылка на историю */}
      <TouchableOpacity onPress={handleHistory}>
        <Text style={[styles.historyLink, { color: currentColors.historyLink }]}>
          История расчётов
        </Text>
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
    fontSize: 18,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  resultBox: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  resultSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  riskBox: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  riskText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 15,
    height: 15,
    marginRight: 5,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  detailsBox: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  exportButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  newCalcButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  historyLink: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
});

export default ResultScreen;