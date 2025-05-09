import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { AuthProvider } from './AuthContext';

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Identify from './screens/Identify';
import Gardens from './screens/Gardens';
import Profile from './screens/Profile';
import CreateGarden from './screens/CreateGarden';

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

          return (
            <Image
              source={iconSource}
              style={{ width: size, height: size, tintColor: color }}
            />
          );
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

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ title: 'Crear Cuenta' }}
          />
          <Stack.Screen
            name="Home"
            component={HomeTabs}
            options={{
              headerShown: false,
              gestureEnabled: false
            }}
          />

          <Stack.Screen
          name="Gardens"
          component={Gardens}
          options={{ title: 'Mis Jardines' }}
        />
        <Stack.Screen
          name="CreateGarden"
          component={CreateGarden}
          options={{ title: 'Crear Jardín' }}
        />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
