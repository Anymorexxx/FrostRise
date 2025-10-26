// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import colors from './constants/colors';

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
  const currentColors = colors[theme] || colors.light; // fallback на light тему

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

// Компонент загрузки шрифтов
function FontLoader({ children }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'IBM-Plex-Mono': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
          'IBM-Plex-Mono-Bold': require('./assets/fonts/IBMPlexMono-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Error loading fonts:', e);
        setFontsLoaded(true); // Продолжаем даже если шрифты не загрузились
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return children;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FontLoader>
          <NavigationContainer>
            <ThemedNavigator />
          </NavigationContainer>
        </FontLoader>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}