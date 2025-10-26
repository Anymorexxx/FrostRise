// screens/HelpScreen.js
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

const HelpScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const currentColors = colors[theme] || colors.light;

  const showPrivacyPolicy = () => {
    Alert.alert(
      'Политика конфиденциальности',
      'Приложение FrostRise не собирает, не передаёт и не хранит персональные данные. Все расчёты и данные хранятся только на вашем устройстве.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentColors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Методика расчета */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentColors.sectionTitle }]}>Методика расчета:</Text>
        <Text style={[styles.text, { color: currentColors.text }]}>
          Адаптированная методика ТСН МФ-97 МО, учитывающая нагрузку от сооружения.
          Позволяет избежать завышенных расчетов по СП 121.13330.2012.
        </Text>
      </View>

      {/* Авторы */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentColors.sectionTitle }]}>Авторы:</Text>
        <Text style={[styles.text, { color: currentColors.text }]}>Разработчик: Шишкина М.В.</Text>
        <Text style={[styles.text, { color: currentColors.text }]}>Научный руководитель: Шишкин В.Я.</Text>
        <Text style={[styles.text, { color: currentColors.text }]}>Дизайнер: Шишкина Н.В.</Text>
      </View>

      {/* Контакты */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentColors.sectionTitle }]}>Контакты:</Text>
        <Text style={[styles.text, { color: currentColors.text }]}>example@university.ru</Text>
      </View>

      {/* Политика конфиденциальности */}
      <View style={styles.privacySection}>
        <TouchableOpacity
          style={styles.privacyLink}
          onPress={showPrivacyPolicy}
        >
          <Text style={[styles.linkText, { color: currentColors.link }]}>Политика конфиденциальности</Text>
        </TouchableOpacity>
      </View>

      {/* Подвал */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: currentColors.text }]}>© 2025 FrostRise</Text>
        <Text style={[styles.footerText, { color: currentColors.text }]}>Версия: {CONFIG.VERSION}</Text>
        <Text style={[styles.footerText, { color: currentColors.text }]}>Обновление: {CONFIG.UPDATE_DATE}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'IBM-Plex-Mono-Bold',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'IBM-Plex-Mono-Regular',
  },
  privacySection: {
    marginTop: 20,
    marginBottom: 30,
  },
  privacyLink: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  linkText: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: 'IBM-Plex-Mono-Regular',
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'IBM-Plex-Mono-Regular',
    marginBottom: 4,
  },
});

export default HelpScreen;