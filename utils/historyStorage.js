// utils/historyStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'calculation_history';

export const HistoryStorage = {
  // Сохранение расчета в историю
  async saveCalculation(calculationData) {
    try {
      const existingHistory = await this.getHistory();
      const newCalculation = {
        id: Date.now().toString(),
        ...calculationData,
        timestamp: new Date().toISOString(),
      };
      
      const updatedHistory = [newCalculation, ...existingHistory].slice(0, 50); // Ограничиваем историю 50 записями
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return newCalculation;
    } catch (error) {
      console.error('Error saving calculation to history:', error);
      throw error;
    }
  },

  // Получение истории расчетов
  async getHistory() {
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting calculation history:', error);
      return [];
    }
  },

  // Удаление расчета из истории
  async deleteCalculation(id) {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error deleting calculation from history:', error);
      throw error;
    }
  },

  // Очистка всей истории
  async clearHistory() {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing calculation history:', error);
      throw error;
    }
  }
};