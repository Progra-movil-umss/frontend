import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Home = ({ onCamera }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la Home</Text>
      <TouchableOpacity style={styles.button} onPress={onCamera}>
        <Text style={styles.buttonText}>Identificar Planta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
  button: { padding: 10, backgroundColor: '#4CAF50', borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 16 },
});

export default Home;
