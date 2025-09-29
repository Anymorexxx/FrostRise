// App.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Загрузка шрифтов
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'IBM-Plex-Mono': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
        'IBM-Plex-Mono-Bold': require('./assets/fonts/IBMPlexMono-Bold.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#000000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Верхняя часть: Настройки */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.headerText}>Настройки</Text>
        </TouchableOpacity>
      </View>

      {/* Центральная часть: Логотип и слоган */}
      <View style={styles.content}>
        <Text style={styles.title}>FrostRise</Text>
        <Text style={styles.subtitle}>
          Точный расчет пучения грунта для дорог, фундаментов и аэродромов
        </Text>

        {/* Кнопка "Новый расчёт" */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Новый расчёт</Text>
        </TouchableOpacity>
      </View>

      {/* Нижняя часть: Справка */}
      <View style={styles.footer}>
        <TouchableOpacity>
          <Text style={styles.footerText}>Справка</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3DAD2', // новый фон
  },
  header: {
    alignItems: 'flex-end',
    padding: 15,
  },
  headerText: {
    color: '#7EA6D9', // новый цвет ссылок
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono', // кастомный шрифт
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000000', // черный текст
    fontFamily: 'IBM-Plex-Mono-Bold', // жирный шрифт
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    color: '#000000',
    fontFamily: 'IBM-Plex-Mono',
  },
  button: {
    backgroundColor: '#8660C9', // новый цвет кнопки
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  footer: {
    alignItems: 'center',
    padding: 15,
  },
  footerText: {
    color: '#7EA6D9', // новый цвет ссылок
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono',
  },
});