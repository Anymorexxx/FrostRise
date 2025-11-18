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
    item.soilName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date?.includes(searchQuery) ||
    item.df?.toString().includes(searchQuery)
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Дата не указана';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Неверная дата';
    }
  };

  const handleView = (item) => {
    const layersInfo = item.layers ? 
    item.layers.map(layer => 
      `${layer.name}: ${layer.thickness} м, ${layer.density} кг/м³`
    ).join('\n') : 'Нет данных о слоях';

    Alert.alert(
      'Детали расчёта',
      `Дата: ${formatDate(item.timestamp)}\nИГЭ: ${item.igE}\nГрунт: ${item.soilName || 'Не указан'}\nГлубина промерзания: ${item.df} м\nКоличество слоев: ${item.layers?.length || 0} из 5\n\nСлои:\n${layersInfo}`,
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

  const renderHistoryItem = ({ item }) => (
    <View style={[styles.historyItem, { 
      backgroundColor: currentColors.inputBackground,
      borderColor: currentColors.inputBorder 
    }]}>
      <Text style={[styles.date, { color: currentColors.text }]}>
        {formatDate(item.timestamp)}
      </Text>
      
      <View style={styles.resultRow}>
        <View style={[styles.tag, { backgroundColor: currentColors.tag }]}>
          <Text style={[styles.tagText, { color: currentColors.text }]}>{item.igE}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: currentColors.tag }]}>
          <Text style={[styles.tagText, { color: currentColors.text }]}>Hn = {item.df} м</Text>
        </View>
      </View>

      {item.soilName && (
        <Text style={[styles.soilName, { color: currentColors.text }]}>
          {item.soilName}
        </Text>
      )}

      {item.layers && item.layers.length > 0 && (
        <Text style={[styles.layersInfo, { color: currentColors.constantText }]}>
          Слоев: {item.layers.length}
        </Text>
      )}

      {item.riskLevel && (
        <View style={[styles.riskTag, { backgroundColor: getRiskColor(item.riskLevel) }]}>
          <Text style={[styles.riskText, { color: currentColors.text }]}>
            {item.riskLevel}
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: currentColors.primaryButton }]}
          onPress={() => handleView(item)}
        >
          <Text style={[styles.buttonText, { color: currentColors.text }]}>Подробнее</Text>
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
  );

  // Функция для получения цвета риска
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Низкий риск': return '#52BC6A';
      case 'Средний риск': return '#F3CC56';
      case 'Высокий риск': return '#BD3F4B';
      default: return currentColors.tag;
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
          placeholder="Поиск по ИГЭ, грунту или дате..."
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
        renderItem={renderHistoryItem}
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  soilName: {
    fontSize: 13,
    marginBottom: 5,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  layersInfo: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontStyle: 'italic',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  riskTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  riskText: {
    fontSize: 11,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  deleteButton: {
    // Стиль уже задан через backgroundColor
  },
  buttonText: {
    fontSize: 11,
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