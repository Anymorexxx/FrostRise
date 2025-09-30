import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { CONFIG } from '../constants/config';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Шапка с кнопкой настроек */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.headerText}>Настройки</Text>
        </TouchableOpacity>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        <Text style={styles.title}>FrostRise</Text>
        <Text style={styles.subtitle}>
          Точный расчет пучения грунта для дорог, фундаментов и аэродромов
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Input')}
        >
          <Text style={styles.buttonText}>Новый расчёт</Text>
        </TouchableOpacity>
      </View>

      {/* Футер с кнопкой справки */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.footerText}>Справка</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
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
    color: colors.light.link,
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -40, // Поднимаем контент немного выше
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    color: colors.light.text,
    fontFamily: 'IBM-Plex-Mono',
  },
  button: {
    backgroundColor: colors.light.primaryButton,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.light.text,
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
    color: colors.light.link,
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono',
  },
  versionText: {
    color: colors.light.sectionTitle,
    fontSize: 12,
    fontFamily: 'IBM-Plex-Mono',
  },
});