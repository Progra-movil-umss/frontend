import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, useColorScheme, Text, Platform } from 'react-native';
import { AuthProvider, AuthContext } from './core/AuthContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Gardens from './screens/Gardens';
import CreateGarden from './screens/CreateGarden';
import Profile from './screens/Profile';
//Identificacion
import Identify from './screens/Identify';
import ResultPlantIdentify from './screens/ResultPlantIdentify';

// Recordatorios
import Alarms from './screens/Alarms';
import PlantasDelJardin from './screens/PlantasDelJardin';
import ConfigurarAlarma from './screens/ConfigurarAlarma';


// Recuperación de contraseña
import PasswordRecoveryScreen from './screens/PasswordRecoveryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconSource;
          if (route.name === 'Inicio') iconSource = require('./assets/home.png');
          else if (route.name === 'Identificar') iconSource = require('./assets/search.png');
          else if (route.name === 'Jardín') iconSource = require('./assets/garden.png');
          else if (route.name === 'Perfil') iconSource = require('./assets/profile.png');
          return <Image source={iconSource} style={{ width: size, height: size, tintColor: color }} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Inicio" component={Home} />
      <Tab.Screen name="Identificar" component={Identify} />
      <Tab.Screen name="Jardín" component={Gardens} />
      <Tab.Screen name="Perfil" component={Profile} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const colorScheme = useColorScheme();
  const { loading, accessToken } = useContext(AuthContext);
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#111' : '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Image source={require('./assets/icon.png')} style={{ width: 80, height: 80, marginBottom: 24 }} />
        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#333', fontSize: 18 }}>Cargando...</Text>
      </View>
    );
  }
  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator initialRouteName={accessToken ? 'Home' : 'Login'}>
        {/* Autenticación */}
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ title: 'Crear Cuenta' }} />
        <Stack.Screen name="PasswordRecovery" component={PasswordRecoveryScreen} options={{ title: 'Recuperar Contraseña' }} />
        {/* Navegación principal */}
        <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false, gestureEnabled: false }} />
        {/* Jardines */}
        <Stack.Screen name="Gardens" component={Gardens} options={{ title: 'Mis Jardines' }} />
        <Stack.Screen name="CreateGarden" component={CreateGarden} options={{ title: 'Crear Jardín' }} />
        {/* Recordatorios */}
        <Stack.Screen name="Alarms" component={Alarms} options={{ title: 'Alarmas' }} />
        <Stack.Screen name="PlantasDelJardin" component={PlantasDelJardin} options={{ title: 'Plantas del Jardín' }} />
        <Stack.Screen name="ConfigurarAlarma" component={ConfigurarAlarma} options={{ title: 'Configurar Alarma' }} />
        {/* Identificacion de la planta */}
        <Stack.Screen name="PlantResult" component={ResultPlantIdentify} options={{ title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
