// screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import colors from '../constants/colors';
import { CONFIG } from '../constants/config';

const SettingsScreen = ({ navigation }) => {
  const [theme, setTheme] = useState('Светлая');
  const [language, setLanguage] = useState('Русский');

  const handleThemeChange = () => {
    Alert.alert(
      'Тема',
      'Выберите тему:',
      [
        { text: 'Светлая', onPress: () => setTheme('Светлая') },
        { text: 'Тёмная', onPress: () => setTheme('Тёмная') },
        { text: 'Системная', onPress: () => setTheme('Системная') },
        { text: 'Отмена', style: 'cancel' },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Язык',
      'Доступный язык:',
      [
        { text: 'Русский', onPress: () => setLanguage('Русский') },
        { text: 'Отмена', style: 'cancel' },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Очистить кэш',
      'Вы уверены, что хотите очистить кэш приложения? Это может ускорить работу, но удалит временные данные.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => Alert.alert('Кэш очищен'),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Внешний вид */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Внешний вид</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleThemeChange}
        >
          <Text style={styles.settingLabel}>Тема</Text>
          <Text style={styles.settingValue}>{theme}</Text>
        </TouchableOpacity>
      </View>

      {/* Системные */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Системные</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleLanguageChange}
        >
          <Text style={styles.settingLabel}>Язык</Text>
          <Text style={styles.settingValue}>{language}</Text>
        </TouchableOpacity>
      </View>

      {/* Очистить кэш */}
      <TouchableOpacity
        style={styles.clearCacheButton}
        onPress={handleClearCache}
      >
        <Text style={styles.buttonText}>Очистить кэш</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.light.sectionTitle,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.light.inputBackground,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.light.inputBorder,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  settingValue: {
    fontSize: 14,
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  clearCacheButton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.light.primaryButton,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  versionContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
});

export default SettingsScreen;