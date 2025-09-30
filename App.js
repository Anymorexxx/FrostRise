// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import colors from './constants/colors';

// Экраны
import HomeScreen from './screens/HomeScreen';
import InputScreen from './screens/InputScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import HelpScreen from './screens/HelpScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Загрузка шрифтов
        await Font.loadAsync({
          'IBM-Plex-Mono': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
          'IBM-Plex-Mono-Bold': require('./assets/fonts/IBMPlexMono-Bold.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.light.header,
            },
            headerTintColor: colors.light.text,
            headerTitleStyle: {
              fontFamily: 'IBM-Plex-Mono-Bold',
              fontSize: 18,
            },
            headerBackTitle: 'Назад',
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Input" 
            component={InputScreen}
            options={{ title: 'Ввод параметров' }}
          />
          <Stack.Screen 
            name="Result" 
            component={ResultScreen}
            options={{ title: 'Результаты расчёта' }}
          />
          <Stack.Screen 
            name="History" 
            component={HistoryScreen}
            options={{ title: 'История расчётов' }}
          />
          <Stack.Screen 
            name="Help" 
            component={HelpScreen}
            options={{ title: 'О приложении' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Настройки' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}