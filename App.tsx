import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { Colors } from './src/theme/colors';
import { BottomNavBar, TabType } from './src/presentation/components/navigation/BottomNavBar';
import { AtmosphericBackground } from './src/presentation/components/brand/AtmosphericBackground';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { MapScreen } from './src/presentation/screens/MapScreen';
import { VarunaAiScreen } from './src/presentation/screens/VarunaAiScreen';
import { AlertsScreen } from './src/presentation/screens/AlertsScreen';
import { ProfileScreen } from './src/presentation/screens/ProfileScreen';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  const [timedOut, setTimedOut] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  useEffect(() => {
    // Safety fallback: Proceed after 1.5s even if font loading is delayed
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontError && !timedOut) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00e5ff" />
      </View>
    );
  }

  const renderCurrentScreen = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onAskAi={() => setCurrentTab('ai')}
          />
        );
      case 'map':
        return <MapScreen onNavigateTab={(tab) => setCurrentTab(tab)} />;
      case 'ai':
        return <VarunaAiScreen />;
      case 'alerts':
        return <AlertsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onAskAi={() => setCurrentTab('ai')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" backgroundColor="#02060e" translucent />
      
      {/* Persistent Global 60 FPS Atmospheric Video Background */}
      <AtmosphericBackground />

      {/* Screen Content View */}
      <View style={styles.screenWrapper}>{renderCurrentScreen()}</View>

      {/* Floating Glass Bottom Navigation */}
      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02060e',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#02060e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenWrapper: {
    flex: 1,
  },
});

