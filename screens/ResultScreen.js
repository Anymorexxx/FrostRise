// ResultScreen.js
import React, { useEffect, useContext } from 'react';
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

const ResultScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;
  
  const { inputData } = route.params;

  // Пример расчета (в реальном проекте — логика из ТЗ)
  const dfSP = parseFloat(inputData.thickness) + 0.5; // Условный расчет по СП
  const dfTSN = dfSP * 0.8; // Условный расчет по ТСН

  // Сохраняем расчёт в историю при загрузке экрана
  useEffect(() => {
    const saveToHistory = async () => {
      try {
        await HistoryStorage.saveCalculation({
          igE: inputData.selectedIGE,
          df: dfSP.toFixed(2),
          thickness: inputData.thickness,
          density: inputData.density,
          moisture: inputData.moisture,
        });
      } catch (error) {
        console.error('Error saving to history:', error);
      }
    };

    saveToHistory();
  }, []);

  // Оценка риска
  let riskLevel = '';
  let riskColor = '';
  if (dfSP < 0.5) {
    riskLevel = 'Низкий риск';
    riskColor = currentColors.risk.low;
  } else if (dfSP < 1.0) {
    riskLevel = 'Средний риск';
    riskColor = currentColors.risk.medium;
  } else {
    riskLevel = 'Высокий риск';
    riskColor = currentColors.risk.high;
  }

  const data = {
    labels: ['СП 121.13330', 'ТСН МФ-97 МО'],
    datasets: [
      {
        data: [dfSP, dfTSN],
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
    Alert.alert('Экспорт', 'Функция экспорта в PDF будет реализована позже');
    // TODO: Реализовать экспорт в PDF
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
      {/* Результат df */}
      <View style={[styles.resultBox, { 
        backgroundColor: currentColors.inputBackground,
        borderColor: currentColors.inputBorder 
      }]}>
        <Text style={[styles.resultText, { color: currentColors.text }]}>df = {dfSP.toFixed(2)} м</Text>
        <Text style={[styles.resultSubtext, { color: currentColors.text }]}>по методике СП 121.13330.2012</Text>
      </View>

      {/* Блок оценки риска */}
      <View style={[styles.riskBox, { backgroundColor: riskColor }]}>
        <Text style={[styles.riskText, { color: currentColors.text }]}>{riskLevel}</Text>
      </View>

      {/* График */}
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
            <Text style={[styles.legendText, { color: currentColors.text }]}>СП 121.13330</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: currentColors.chart.tsn }]} />
            <Text style={[styles.legendText, { color: currentColors.text }]}>ТСН МФ-97 МО</Text>
          </View>
        </View>
      </View>

      {/* Кнопки */}
      <TouchableOpacity
        style={[styles.exportButton, { backgroundColor: currentColors.exportButton }]}
        onPress={handleExport}
      >
        <Text style={[styles.buttonText, { color: currentColors.text }]}>Экспорт в PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.newCalcButton, { backgroundColor: currentColors.primaryButton }]}
        onPress={handleNewCalculation}
      >
        <Text style={[styles.buttonText, { color: currentColors.text }]}>Новый расчёт</Text>
      </TouchableOpacity>

      {/* Ссылка на историю */}
      <TouchableOpacity onPress={handleHistory}>
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