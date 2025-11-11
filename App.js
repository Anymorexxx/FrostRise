// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import colors from './constants/colors';
import { initDatabase } from './database/database';

// Экраны
import HomeScreen from './screens/HomeScreen';
import InputScreen from './screens/InputScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import HelpScreen from './screens/HelpScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();

// Создаём отдельный компонент для навигатора с темой
function ThemedNavigator() {
  const { theme } = useTheme();
  const currentColors = colors[theme] || colors.light;

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: currentColors.header,
        },
        headerTintColor: currentColors.text,
        headerTitleStyle: {
          fontFamily: 'IBM-Plex-Mono-Bold',
          fontSize: 18,
        },
        headerBackTitle: 'Назад',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Input" component={InputScreen} options={{ title: 'Ввод параметров' }} />
      <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Результаты расчёта' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'История расчётов' }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'О приложении' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Настройки' }} />
    </Stack.Navigator>
  );
}

// Компонент загрузки шрифтов и инициализации БД
function AppLoader({ children }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('Загрузка шрифтов...');

  useEffect(() => {
  async function initializeApp() {
    try {
      // Шаг 1: Загрузка шрифтов
      setLoadingProgress('Загрузка шрифтов...');
      await Font.loadAsync({
        'IBM-Plex-Mono': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
        'IBM-Plex-Mono-Bold': require('./assets/fonts/IBMPlexMono-Bold.ttf'),
      });
      setFontsLoaded(true);

      // Шаг 2: Инициализация БД
      setLoadingProgress('Инициализация базы данных...');
      await initDatabase();
      setDbInitialized(true);
      
    } catch (error) {
      console.warn('Error during app initialization:', error);
      setFontsLoaded(true);
      setDbInitialized(true);
    }
  }

  initializeApp();
}, []);

  if (!fontsLoaded || !dbInitialized) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.light.background 
      }}>
        <ActivityIndicator size="large" color="#7234ED" />
        <Text style={{ 
          marginTop: 20, 
          fontSize: 16,
          color: colors.light.text,
          fontFamily: 'System',
          textAlign: 'center'
        }}>
          {loadingProgress}
        </Text>
        <Text style={{ 
          marginTop: 10, 
          fontSize: 12,
          color: colors.light.constantText,
          fontFamily: 'System',
          textAlign: 'center'
        }}>
          FrostRise
        </Text>
      </View>
    );
  }

  return children;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppLoader>
          <NavigationContainer>
            <ThemedNavigator />
          </NavigationContainer>
        </AppLoader>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}