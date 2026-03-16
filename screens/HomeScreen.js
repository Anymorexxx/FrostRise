import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Platform } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('Help')}
        >
          <Ionicons name="help-circle-outline" size={28} color={currentColors.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={26} color={currentColors.iconColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: currentColors.tag, shadowColor: currentColors.primaryButton }]}>
          <Ionicons name="snow-outline" size={64} color={currentColors.tagText} />
        </View>
        <Text style={[styles.title, { color: currentColors.text }]}>FrostRise</Text>
        <Text style={[styles.subtitle, { color: currentColors.constantText }]}>
          Точный расчёт глубины промерзания грунта для дорог, фундаментов и аэродромов
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentColors.primaryButton, shadowColor: currentColors.primaryButton }]}
          onPress={() => navigation.navigate('Input')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Новый расчёт</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'IBM-Plex-Mono-Bold',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
    fontFamily: 'IBM-Plex-Mono',
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: width * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  buttonIcon: {
    marginLeft: 10,
  }
});