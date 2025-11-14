// utils/historyStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@frostrise_history';

export const HistoryStorage = {
  // Сохранение расчета в историю
  saveCalculation: async (calculationData) => {
    try {
      const history = await HistoryStorage.getHistory();
      
      const newCalculation = {
        id: Date.now().toString(),
        timestamp: calculationData.timestamp || new Date().toISOString(),
        igE: calculationData.igE,
        soilName: calculationData.soilName,
        df: calculationData.df,
        layers: calculationData.layers || [],
        climateData: calculationData.climateData,
        riskLevel: calculationData.riskLevel,
      };
      
      history.unshift(newCalculation);
      
      // Сохраняем только последние 100 расчетов
      const limitedHistory = history.slice(0, 100);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
      
      return newCalculation;
    } catch (error) {
      console.error('Error saving calculation to history:', error);
      throw error;
    }
  },

  // Получение истории расчетов
  getHistory: async () => {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },

  // Удаление расчета из истории
  deleteCalculation: async (id) => {
    try {
      const history = await HistoryStorage.getHistory();
      const filteredHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
      return true;
    } catch (error) {
      console.error('Error deleting calculation:', error);
      throw error;
    }
  },

  // Очистка всей истории
  clearHistory: async () => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }
};