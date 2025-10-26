// utils/historyStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@frostrise_history';

export const HistoryStorage = {
  // Сохранить расчёт
  async saveCalculation(calculation) {
    try {
      const existingHistory = await this.getHistory();
      const newCalculation = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('ru-RU'),
        ...calculation,
      };
      
      const updatedHistory = [newCalculation, ...existingHistory];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return newCalculation;
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw error;
    }
  },

  // Получить историю
  async getHistory() {
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },

  // Очистить историю
  async clearHistory() {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  },

  // Удалить один расчёт
  async deleteCalculation(id) {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Error deleting calculation:', error);
      throw error;
    }
  },
};