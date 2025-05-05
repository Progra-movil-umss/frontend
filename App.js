import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Gardens from './screens/Gardens';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
          component={Home}
          options={{
            title: 'Inicio',
            headerLeft: () => null,
            gestureEnabled: false
          }}
        />
        
        <Stack.Screen
          name="Gardens"
          component={Gardens}
          options={{ title: 'Mis Jardines' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}