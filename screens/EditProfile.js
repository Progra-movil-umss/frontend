// EditProfile.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EditProfile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla Editar Perfil (próximamente)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
});

export default EditProfile;
