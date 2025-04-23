import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

export default function App() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>      
      <StatusBar style="dark" />
      {showRegister ? (
        <RegisterScreen onBack={() => setShowRegister(false)} />
      ) : (
        <LoginScreen onRegister={() => setShowRegister(true)} />
      )}
    </>
  );
}