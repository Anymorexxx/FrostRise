// screens/SettingsScreen.js
import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors';
import { CONFIG } from '../constants/config';

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [language, setLanguage] = React.useState('Русский');

  const currentColors = colors[theme] || colors.light;

  const handleThemeChange = () => {
    Alert.alert(
      'Тема',
      'Выберите тему:',
      [
        { text: 'Светлая', onPress: () => toggleTheme('light') },
        { text: 'Тёмная', onPress: () => toggleTheme('dark') },
        { text: 'Системная', onPress: () => toggleTheme('system') },
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
      'Вы уверены, что хотите очистить кэш приложения?',
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

  const getThemeName = () => {
    switch (theme) {
      case 'light': return 'Светлая';
      case 'dark': return 'Тёмная';
      case 'system': return 'Системная';
      default: return 'Светлая';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Внешний вид */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentColors.sectionTitle }]}>Внешний вид</Text>
        <TouchableOpacity
          style={[styles.settingItem, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder 
          }]}
          onPress={handleThemeChange}
        >
          <Text style={[styles.settingLabel, { color: currentColors.text }]}>Тема</Text>
          <Text style={[styles.settingValue, { color: currentColors.text }]}>{getThemeName()}</Text>
        </TouchableOpacity>
      </View>

      {/* Системные */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentColors.sectionTitle }]}>Системные</Text>
        <TouchableOpacity
          style={[styles.settingItem, { 
            backgroundColor: currentColors.inputBackground,
            borderColor: currentColors.inputBorder 
          }]}
          onPress={handleLanguageChange}
        >
          <Text style={[styles.settingLabel, { color: currentColors.text }]}>Язык</Text>
          <Text style={[styles.settingValue, { color: currentColors.text }]}>{language}</Text>
        </TouchableOpacity>
      </View>

      {/* Очистить кэш */}
      <TouchableOpacity
        style={[styles.clearCacheButton, { backgroundColor: currentColors.primaryButton }]}
        onPress={handleClearCache}
      >
        <Text style={[styles.buttonText, { color: currentColors.text }]}>Очистить кэш</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  clearCacheButton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  versionContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
});

export default SettingsScreen;