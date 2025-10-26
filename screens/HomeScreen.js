// screens/HomeScreen.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors';
import { CONFIG } from '../constants/config';

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Шапка с кнопкой настроек */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.headerText, { color: currentColors.link }]}>Настройки</Text>
        </TouchableOpacity>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: currentColors.text }]}>FrostRise</Text>
        <Text style={[styles.subtitle, { color: currentColors.text }]}>
          Точный расчет пучения грунта для дорог, фундаментов и аэродромов
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentColors.primaryButton }]}
          onPress={() => navigation.navigate('Input')}
        >
          <Text style={[styles.buttonText, { color: currentColors.text }]}>Новый расчёт</Text>
        </TouchableOpacity>
      </View>

      {/* Футер с кнопкой справки */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={[styles.footerText, { color: currentColors.link }]}>Справка</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  settingsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    fontFamily: 'IBM-Plex-Mono',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  helpButton: {
    marginBottom: 15,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono',
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono',
  },
});