import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Login from './screens/Login';
import Register from './screens/Register';
import CameraScreen from './screens/CameraScreen';
import Home from './screens/Home';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');

  return (
    <>
      <StatusBar style="dark" />
      {currentScreen === 'home' ? (
        <Home 
          onCamera={() => setCurrentScreen('camera')} />
      ) : currentScreen === 'camera' ? (
        <CameraScreen 
        onBack={() => setCurrentScreen('home')} 
        onClose={() => setCurrentScreen('home')} 
        />
      ) : currentScreen === 'home' ? (
        <Home onCamera={() => setCurrentScreen('camera')} />
      ) : currentScreen === 'register' ? (
        <Register 
          onBack={() => setCurrentScreen('login')} />
      ) : (
        <Login 
          onRegister={() => setCurrentScreen('register')} 
          onHome={() => setCurrentScreen('home')} 
        />
      )}
    </>
  );
}
