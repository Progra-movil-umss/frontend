import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar'; // Importa el componente Navbar

const Home = ({ route }) => {
  const { accessToken } = route.params || {}; // Obtén el accessToken de los parámetros de navegación

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenido, tu token es:</Text>
      <Text style={[styles.welcome, { fontSize: 14 }]} numberOfLines={1}>
        {accessToken}
      </Text>

      {/* Pasa el accessToken al Navbar */}
      <Navbar accessToken={accessToken} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default Home;
