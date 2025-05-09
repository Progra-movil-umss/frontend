import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import CustomInput from '../components/CustomInput';

const CreateGarden = ({ route, navigation }) => {
  const { accessToken } = route.params || {}; // Retrieve access token

  const [gardenName, setGardenName] = useState('');
  const [gardenDescription, setGardenDescription] = useState('');

  const handleCreateGarden = async () => {
    if (!gardenName) {
      Alert.alert('Error', 'El nombre del jardín es obligatorio');
      return;
    }

    try {
      const response = await fetch('https://tu-api.com/gardens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: gardenName, description: gardenDescription }),
      });
      if (response.ok) {
        Alert.alert('Éxito', 'Jardín creado con éxito');
        navigation.navigate('Gardens');
      } else {
        throw new Error('Error al crear el jardín');
      }
    } catch (error) {
      console.error('Error al crear el jardín:', error);
      Alert.alert('Error', 'Hubo un problema al crear el jardín');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Jardín</Text>

      <CustomInput
        label="Nombre del Jardín"
        placeholder="Ingrese el nombre del jardín"
        value={gardenName}
        onChangeText={setGardenName}
      />

      <Text style={styles.descriptionLabel}>Descripción (opcional)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Ingrese una descripción"
        value={gardenDescription}
        onChangeText={setGardenDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={handleCreateGarden}
      >
        <Text style={styles.buttonText}>Crear Jardín</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: {
    fontSize: 28,  // Título más grande
    fontWeight: 'bold',
    color: '#4CAF50',  // Color principal
    marginBottom: 40,  // Más arriba
    textAlign: 'center',
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    
  },
  textArea: {
    height: 150,  // Más altura para la descripción
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  createButton: {
    backgroundColor: '#4CAF50',  // Botón verde
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',  // Texto centrado en el botón
  },
});

export default CreateGarden;
