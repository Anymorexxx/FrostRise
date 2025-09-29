import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

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
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.headerText}>Настройки</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>FrostRise</Text>
        <Text style={styles.subtitle}>
          Точный расчет пучения грунта для дорог, фундаментов и аэродромов
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Новый расчёт</Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#F3DAD2', 
  },
  header: {
    alignItems: 'flex-end',
    padding: 15,
  },
  headerText: {
    color: '#7EA6D9', 
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono',
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
    color: '#000000',
    fontFamily: 'IBM-Plex-Mono-Bold',
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
    backgroundColor: '#8660C9',
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
    color: '#7EA6D9',
    fontSize: 16,
    fontFamily: 'IBM-Plex-Mono',
  },
});