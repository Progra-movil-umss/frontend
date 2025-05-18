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
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name || "Sin nombre"}</Text>
        <Text style={styles.scientificName}>{scientificName || "Nombre científico desconocido"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    width: 160,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,  // Solo borde superior izquierdo redondeado
    borderTopRightRadius: 16, // Solo borde superior derecho redondeado
    borderBottomLeftRadius: 0,  // Los bordes inferiores sin redondear para "salir" del card
    borderBottomRightRadius: 0,
    marginBottom: 12,
    backgroundColor: '#777',
  },
  textContainer: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,  // Bordes inferiores redondeados
    borderBottomRightRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#222',
  },
  scientificName: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CardPlants;
