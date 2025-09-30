// screens/HistoryScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import colors from '../constants/colors';

const HistoryScreen = ({ navigation }) => {
  // Пример данных (в реальном проекте — из SQLite)
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([
    {
      id: 1,
      date: '12.04.2025',
      igE: '14_1',
      df: '0.8 м',
    },
    {
      id: 2,
      date: '10.04.2025',
      igE: '11_2',
      df: '0.65 м',
    },
    {
      id: 3,
      date: '08.04.2025',
      igE: '13_1',
      df: '0.72 м',
    },
  ]);

  const filteredHistory = history.filter(item =>
    item.igE.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date.includes(searchQuery)
  );

  const handleView = (item) => {
    Alert.alert('Просмотр', `Дата: ${item.date}\nИГЭ: ${item.igE}\ndf: ${item.df}`);
  };

  const handleExport = (item) => {
    Alert.alert('Экспорт', `Экспорт расчёта ${item.id} в PDF...`);
  };

  const handleClear = () => {
    Alert.alert(
      'Очистить историю',
      'Вы уверены, что хотите удалить всю историю расчётов?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => setHistory([]),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Поиск в iOS стиле с лупой */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Text style={styles.searchIconText}>🔍</Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по ИГЭ или дате..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.light.constantText}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Список истории */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.resultRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.igE}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>df = {item.df}</Text>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleView(item)}
              >
                <Text style={styles.buttonText}>Посмотреть</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleExport(item)}
              >
                <Text style={styles.buttonText}>Экспорт</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noResults}>Больше результатов не найдено</Text>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Кнопка Очистить */}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={handleClear}
      >
        <Text style={styles.buttonText}>Очистить историю</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.inputBackground,
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
    color: colors.light.text,
    paddingVertical: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  historyItem: {
    backgroundColor: colors.light.inputBackground,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.light.inputBorder,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.light.text,
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
    backgroundColor: colors.light.tag,
  },
  tagText: {
    color: colors.light.text,
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
    backgroundColor: colors.light.primaryButton,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.light.noResults,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  clearButton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.light.clearHistory,
  },
});

export default HistoryScreen;