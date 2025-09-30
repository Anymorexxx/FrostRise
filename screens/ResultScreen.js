// ResultScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import colors from '../constants/colors.js';
import { BarChart } from 'react-native-chart-kit';

const ResultScreen = ({ route, navigation }) => {
  const { inputData } = route.params;

  // Пример расчета (в реальном проекте — логика из ТЗ)
  const dfSP = parseFloat(inputData.thickness) + 0.5; // Условный расчет по СП
  const dfTSN = dfSP * 0.8; // Условный расчет по ТСН

  // Оценка риска
  let riskLevel = '';
  let riskColor = '';
  if (dfSP < 0.5) {
    riskLevel = 'Низкий риск';
    riskColor = colors.light.risk.low;
  } else if (dfSP < 1.0) {
    riskLevel = 'Средний риск';
    riskColor = colors.light.risk.medium;
  } else {
    riskLevel = 'Высокий риск';
    riskColor = colors.light.risk.high;
  }

  const data = {
    labels: ['СП 121.13330', 'ТСН МФ-97 МО'],
    datasets: [
      {
        data: [dfSP, dfTSN],
        colors: [(opacity = 1) => colors.light.chart.sp, (opacity = 1) => colors.light.chart.tsn],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.light.inputBackground,
    backgroundGradientTo: colors.light.inputBackground,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const handleExportPDF = () => {
    Alert.alert('Экспорт в PDF', 'Функция пока не реализована.');
  };

  const handleNewCalculation = () => {
    navigation.navigate('Input');
  };

  const handleHistory = () => {
    navigation.navigate('History');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Результат df */}
      <View style={styles.resultBox}>
        <Text style={styles.resultText}>df = {dfSP.toFixed(2)} м</Text>
        <Text style={styles.resultSubtext}>по методике СП 121.13330.2012</Text>
      </View>

      {/* Блок оценки риска */}
      <View style={[styles.riskBox, { backgroundColor: riskColor }]}>
        <Text style={styles.riskText}>{riskLevel}</Text>
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
            <View style={[styles.legendColor, { backgroundColor: colors.light.chart.sp }]} />
            <Text style={styles.legendText}>СП 121.13330</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.light.chart.tsn }]} />
            <Text style={styles.legendText}>ТСН МФ-97 МО</Text>
          </View>
        </View>
      </View>

      {/* Кнопки */}
      <TouchableOpacity
        style={styles.exportButton}
        onPress={handleExportPDF}
      >
        <Text style={styles.buttonText}>Экспорт в PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.newCalcButton}
        onPress={handleNewCalculation}
      >
        <Text style={styles.buttonText}>Новый расчёт</Text>
      </TouchableOpacity>

      {/* Ссылка на историю */}
      <TouchableOpacity onPress={handleHistory}>
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
  resultBox: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    backgroundColor: colors.light.inputBackground,
    borderColor: colors.light.inputBorder,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  resultSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  riskBox: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
    borderColor: colors.light.inputBorder,
  },
  riskText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
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
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  exportButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: colors.light.exportButton,
  },
  newCalcButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: colors.light.primaryButton,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  historyLink: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: colors.light.historyLink,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
});

export default ResultScreen;