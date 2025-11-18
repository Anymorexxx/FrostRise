// screens/ResultScreen.js
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
import LayerDetails from '../components/LayerDetails';
import CalculationFormulas from '../components/CalculationFormulas';

const ResultScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;
  
  const { inputData } = route.params;
  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLayers, setExpandedLayers] = useState({});

  // Выполняем расчет при загрузке экрана
  useEffect(() => {
    performCalculation();
  }, []);

  const performCalculation = async () => {
    try {
      setLoading(true);
      const result = await CalculationService.calculateFreezingDepth(inputData);
      setCalculationResult(result);
      
      // Сохраняем в историю с новой структурой
      await HistoryStorage.saveCalculation({
        igE: inputData.selectedIGE,
        soilName: inputData.soilData.subsoilName,
        df: result.Hn,
        layers: inputData.layers,
        climateData: inputData.climateData,
        riskLevel: result.riskLevel,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('Calculation error:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить расчет');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleLayer = (layerId) => {
    setExpandedLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  // Функция для подготовки детальных расчетов как в test.py
  const prepareDetailedCalculations = (inputData, result) => {
    const L = 334; // Теплота фазового перехода
    const kw = 0.65; // Коэффициент
    
    // Расчет ww для грунта
    const ww_soil = kw * parseFloat(inputData.soilData.wp);
    
    // Параметры грунта (последний слой)
    const lambda_f_soil = parseFloat(inputData.soilData.lambdaF);
    const Cf_soil = parseFloat(inputData.soilData.cF);
    const pd_soil = parseFloat(inputData.soilData.pd);
    const w_soil = parseFloat(inputData.soilData.w);
    const wp_soil = parseFloat(inputData.soilData.wp);
    const t0_val = parseFloat(inputData.soilData.t0);
    const theta_mp = parseFloat(inputData.climateData.tcp);
    const tau_f = parseFloat(inputData.climateData.tf);
    
    // Расчет η для каждого слоя
    const layersWithEta = inputData.layers.map((layer, index) => {
      const thickness = parseFloat(layer.thickness);
      const lambda_f = parseFloat(layer.lambdaF);
      const Cf = parseFloat(layer.cF);
      const pd = parseFloat(layer.density);
      const w = parseFloat(layer.moisture);
      
      // Для конструкционных слоев
      const ww = 0; // по условию для конструкционных слоев
      const eta_f = 0.5 * theta_mp * Cf + pd * (w - ww) * L;
      
      return {
        ...layer,
        thickness: thickness,
        lambda_f: lambda_f,
        Cf: Cf,
        pd: pd,
        w: w,
        eta_f: eta_f
      };
    });
    
    // Добавляем грунт как последний слой
    const eta_f_soil = 0.5 * theta_mp * Cf_soil + pd_soil * (w_soil - ww_soil) * L;
    const eta_f_0_soil = 0.5 * t0_val * Cf_soil + pd_soil * (w_soil - ww_soil) * L;
    
    const soilLayer = {
      name: inputData.soilData.subsoilName,
      thickness: " - ",
      lambda_f: lambda_f_soil,
      Cf: Cf_soil,
      pd: pd_soil,
      w: w_soil,
      eta_f: eta_f_soil,
      eta_f_0: eta_f_0_soil
    };
    
    const allLayers = [...layersWithEta, soilLayer];
    
    // Расчет суммы Σ
    const lambda_f_grunt = lambda_f_soil;
    const eta_f_grunt = eta_f_soil;
    
    let sum_sigma = 0.0;
    const sigmas = [];
    
    for (let i = 0; i < layersWithEta.length; i++) {
      const layer = layersWithEta[i];
      const thickness = layer.thickness;
      const lambda_f_i = layer.lambda_f;
      const eta_f_i = layer.eta_f;
      
      const term = thickness * Math.sqrt((lambda_f_grunt * eta_f_i) / (lambda_f_i * eta_f_grunt));
      sigmas.push(term);
      sum_sigma += term;
    }
    
    // Расчет Hn по частям
    const part1 = 1.9 * Math.sqrt(2 * lambda_f_grunt * tau_f);
    const part2 = Math.sqrt(theta_mp / eta_f_grunt) - Math.sqrt(t0_val / eta_f_0_soil);
    const Hn_calculated = part1 * part2 - sum_sigma;
    
    return {
      ww_soil: ww_soil,
      lambda_f_grunt: lambda_f_grunt,
      eta_f_grunt: eta_f_grunt,
      eta_f_0_grunt: eta_f_0_soil,
      theta_mp: theta_mp,
      tau_f: tau_f,
      t0: t0_val,
      sum_sigma: sum_sigma,
      part1: part1,
      part2: part2,
      Hn: Hn_calculated,
      layers: allLayers,
      sigmas: sigmas
    };
  };

  const handleExport = async () => {
    try {
      const detailedCalculations = prepareDetailedCalculations(inputData, calculationResult);
      
      const pdfData = {
        date: new Date().toLocaleDateString('ru-RU'),
        inputData: {
          selectedIGE: inputData.selectedIGE,
          soilData: inputData.soilData,
          layers: inputData.layers,
          climateData: inputData.climateData,
          insulationEnabled: inputData.insulationEnabled,
          lambdaF: inputData.soilData?.lambdaF,
          cF: inputData.soilData?.cF,
          t0: inputData.soilData?.t0,
          pd: inputData.soilData?.pd,
          w: inputData.soilData?.w,
          wp: inputData.soilData?.wp,
          ip: inputData.soilData?.ip,
          subsoilName: inputData.soilData?.subsoilName,
          tcp: inputData.climateData?.tcp,
          tf: inputData.climateData?.tf,
          kw: 0.65
        },
        result: {
          Hn: calculationResult.Hn,
          Hf: calculationResult.Hf,
          Hn_Penoplex: calculationResult.Hn_Penoplex,
          Hf_Penoplex: calculationResult.Hf_Penoplex,
          riskLevel: calculationResult.riskLevel,
          calculationDetails: calculationResult.calculationDetails
        },
        detailedCalculations: detailedCalculations
      };

      const pdfPath = await generatePDF(pdfData, '');
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

  const { 
    Hn, 
    Hf,
    Hn_Penoplex, 
    Hf_Penoplex,
    riskLevel, 
    riskColor, 
    calculationDetails,
    Hi_Hf_ratio,
    mz,
    sf 
  } = calculationResult;

  // Получаем короткое название грунта для графика
  const getShortSoilName = () => {
    const fullName = inputData.soilData.subsoilName || 'Грунт';
    // Берем первые 10 символов для графика
    return fullName.length > 10 ? fullName.substring(0, 10) + '...' : fullName;
  };

  const soilName = getShortSoilName();

  // Данные для графика Hf
  const dataHf = {
    labels: [soilName, 'Пеноплекс'],
    datasets: [
      {
        data: [parseFloat(Hf), parseFloat(Hf_Penoplex)],
        colors: [(opacity = 1) => currentColors.chart.sp, (opacity = 1) => currentColors.chart.penoplex],
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

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentColors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Основные результаты */}
      <View style={[styles.resultBox, { 
        backgroundColor: currentColors.inputBackground,
        borderColor: currentColors.inputBorder 
      }]}>
        <Text style={[styles.resultText, { color: currentColors.text }]}>
          Hn = {Hn} м
        </Text>
        
        <View style={styles.hfResult}>
          <Text style={[styles.hfText, { color: currentColors.text }]}>
            Hf = {Hf} м
          </Text>
        </View>
      </View>

      {/* Блок оценки риска */}
      <View style={[styles.riskBox, { backgroundColor: riskColor }]}>
        <Text style={[styles.riskText, { color: currentColors.text }]}>
          {riskLevel}
        </Text>
      </View>

      {/* График сравнения Hf */}
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: currentColors.text }]}>
          Сравнение Hf (высота промороженной толщи)
        </Text>
        <BarChart
          data={dataHf}
          width={300}
          height={200}
          yAxisLabel=""
          yAxisSuffix=" м"
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero={true}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: currentColors.chart.sp }]} />
            <Text style={[styles.legendText, { color: currentColors.text }]}>
              {inputData.soilData.subsoilName}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: currentColors.chart.penoplex }]} />
            <Text style={[styles.legendText, { color: currentColors.text }]}>
              Пеноплекс
            </Text>
          </View>
        </View>
      </View>

      {/* Данные по Пеноплексу */}
      <View style={[styles.detailsBox, { 
        backgroundColor: currentColors.inputBackground,
        borderColor: currentColors.inputBorder 
      }]}>
        <Text style={[styles.detailsTitle, { color: currentColors.text }]}>
          Расчет для Пеноплекса:
        </Text>
        
        <View style={styles.additionalResults}>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: currentColors.inputText }]}>Hn (Пеноплекс):</Text>
            <Text style={[styles.resultValue, { color: currentColors.text }]}>{Hn_Penoplex} м</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: currentColors.inputText }]}>Hf (Пеноплекс):</Text>
            <Text style={[styles.resultValue, { color: currentColors.text }]}>{Hf_Penoplex} м</Text>
          </View>
        </View>
      </View>

      {/* Расчетные слои с возможностью раскрытия */}
      <View style={[styles.detailsBox, { 
        backgroundColor: currentColors.inputBackground,
        borderColor: currentColors.inputBorder 
      }]}>
        <Text style={[styles.detailsTitle, { color: currentColors.text }]}>
          Расчетные слои ({inputData.layers.length}):
        </Text>
        <Text style={[styles.detailsSubtitle, { color: currentColors.inputText }]}>
          Нажмите на слой для просмотра параметров
        </Text>
        
        {inputData.layers.map((layer) => (
          <LayerDetails
            key={layer.id}
            layer={layer}
            calculationDetails={calculationDetails}
            isExpanded={expandedLayers[layer.id]}
            onToggle={() => toggleLayer(layer.id)}
          />
        ))}
      </View>

      {/* Детали расчета с формулами */}
      <CalculationFormulas calculationDetails={calculationDetails} />

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
  hfResult: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  hfText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  hfSubtext: {
    fontSize: 12,
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
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'IBM-Plex-Mono-Bold',
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
    maxWidth: 120,
  },
  detailsBox: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  detailsSubtitle: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  additionalResults: {
    marginTop: 5,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  resultLabel: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '500',
    flex: 1,
  },
  resultValue: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  inputData: {
    marginTop: 5,
  },
  inputDataText: {
    fontSize: 12,
    lineHeight: 18,
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