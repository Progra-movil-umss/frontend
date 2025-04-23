import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Login from './screens/Login';
import Register from './screens/Register';

export default function App() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>      
      <StatusBar style="dark" />
      {showRegister ? (
        <Register onBack={() => setShowRegister(false)} />
      ) : (
        <Login onRegister={() => setShowRegister(true)} />
      )}
    </>
  );
}