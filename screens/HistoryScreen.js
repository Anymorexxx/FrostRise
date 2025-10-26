// screens/HistoryScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors';
import { HistoryStorage } from '../utils/historyStorage';

const HistoryScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([]);

  // Загрузка истории при монтировании
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await HistoryStorage.getHistory();
      setHistory(savedHistory);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить историю');
    }
  };

  const filteredHistory = history.filter(item =>
    item.igE?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date?.includes(searchQuery) ||
    item.df?.toString().includes(searchQuery)
  );

  const handleView = (item) => {
    Alert.alert(
      'Детали расчёта',
      `Дата: ${item.date}\nИГЭ: ${item.igE}\ndf: ${item.df}\nТолщина: ${item.thickness} м\nПлотность: ${item.density} кг/м³`,
      [{ text: 'OK' }]
    );
  };

  const handleExport = (item) => {
    Alert.alert('Экспорт', `Экспорт расчёта ${item.id} в PDF...`);
    // Здесь будет вызов функции экспорта в PDF
  };

  const handleClear = async () => {
    Alert.alert(
      'Очистить историю',
      'Вы уверены, что хотите удалить всю историю расчётов?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            try {
              await HistoryStorage.clearHistory();
              setHistory([]);
              Alert.alert('Успех', 'История очищена');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось очистить историю');
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = async (id) => {
    try {
      await HistoryStorage.deleteCalculation(id);
      setHistory(history.filter(item => item.id !== id));
      Alert.alert('Успех', 'Расчёт удалён');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить расчёт');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Поиск в iOS стиле с лупой */}
      <View style={[styles.searchContainer, { 
        backgroundColor: currentColors.inputBackground 
      }]}>
        <View style={styles.searchIcon}>
          <Text style={styles.searchIconText}>🔍</Text>
        </View>
        <TextInput
          style={[styles.searchInput, { color: currentColors.text }]}
          placeholder="Поиск по ИГЭ или дате..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={currentColors.constantText}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Список истории */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.historyItem, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder 
          }]}>
            <Text style={[styles.date, { color: currentColors.text }]}>{item.date}</Text>
            <View style={styles.resultRow}>
              <View style={[styles.tag, { backgroundColor: currentColors.tag }]}>
                <Text style={[styles.tagText, { color: currentColors.text }]}>{item.igE}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: currentColors.tag }]}>
                <Text style={[styles.tagText, { color: currentColors.text }]}>df = {item.df}</Text>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: currentColors.primaryButton }]}
                onPress={() => handleView(item)}
              >
                <Text style={[styles.buttonText, { color: currentColors.text }]}>Посмотреть</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: currentColors.exportButton }]}
                onPress={() => handleExport(item)}
              >
                <Text style={[styles.buttonText, { color: currentColors.text }]}>Экспорт</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton, { backgroundColor: currentColors.clearHistory }]}
                onPress={() => handleDeleteItem(item.id)}
              >
                <Text style={[styles.buttonText, { color: currentColors.text }]}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.noResults, { color: currentColors.noResults }]}>
            {history.length === 0 ? 'История расчётов пуста' : 'Больше результатов не найдено'}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Кнопка Очистить */}
      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: currentColors.clearHistory }]}
        onPress={handleClear}
      >
        <Text style={[styles.buttonText, { color: currentColors.text }]}>Очистить историю</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchIconText: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
    paddingVertical: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  historyItem: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  deleteButton: {
    // Стиль уже задан через backgroundColor
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
    textAlign: 'center',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  clearButton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default HistoryScreen;