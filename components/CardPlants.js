// components/CardPlants.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const CardPlants = ({ imageUri, name, scientificName }) => {
  
  const defaultImgPlant = require('../assets/defaultPlant.png');
  return (
    <View style={styles.card}>
      <Image
        source={imageUri ? { uri: imageUri } : defaultImgPlant } // Imagen predeterminada si no existe URL
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.name}>{name}</Text>  {/* Alias */}
      <Text style={styles.scientificName}>{scientificName}</Text>  {/* Nombre científico */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 160,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111',
  },
  scientificName: {
    fontSize: 12,
    color: '#777',  // Color más tenue para el nombre científico
  },
});

export default CardPlants;
