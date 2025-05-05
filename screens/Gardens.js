import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput'; // Ya tienes este componente

const Gardens = ({ route }) => {
  const { accessToken } = route.params; // Accede al token para saber qué usuario está usando la app
  const [gardens, setGardens] = useState([]);
  const [gardenName, setGardenName] = useState('');
  const [gardenDescription, setGardenDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Obtener los jardines del usuario al cargar la pantalla (supón que ya tienes una API para esto)
    fetchGardens();
  }, []);

  const fetchGardens = async () => {
    try {
      const response = await fetch('https://tu-api.com/gardens', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setGardens(data);
    } catch (error) {
      console.error('Error al obtener jardines:', error);
    }
  };

  const handleCreateGarden = async () => {
    if (!gardenName) {
      Alert.alert('Error', 'El nombre del jardín es obligatorio');
      return;
    }

    // Verifica que el nombre no esté duplicado
    if (gardens.some(garden => garden.name === gardenName)) {
      Alert.alert('Error', 'Ya tienes un jardín con ese nombre');
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
        fetchGardens(); // Recarga la lista de jardines
      } else {
        throw new Error('Error al crear el jardín');
      }
    } catch (error) {
      console.error('Error al crear el jardín:', error);
      Alert.alert('Error', 'Hubo un problema al crear el jardín');
    }
  };

  const handleEditGarden = async () => {
    if (!gardenName) {
      Alert.alert('Error', 'El nombre del jardín es obligatorio');
      return;
    }

    try {
      const response = await fetch(`https://tu-api.com/gardens/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: gardenName, description: gardenDescription }),
      });
      if (response.ok) {
        Alert.alert('Éxito', 'Jardín editado con éxito');
        fetchGardens(); // Recarga la lista de jardines
        setIsEditing(false);
        setEditingId(null);
      } else {
        throw new Error('Error al editar el jardín');
      }
    } catch (error) {
      console.error('Error al editar el jardín:', error);
      Alert.alert('Error', 'Hubo un problema al editar el jardín');
    }
  };

  const handleDeleteGarden = async (id) => {
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas eliminar este jardín? Esto eliminará también todas las plantas asociadas.',
      [
        {
          text: 'Cancelar',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              const response = await fetch(`https://tu-api.com/gardens/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              if (response.ok) {
                Alert.alert('Éxito', 'Jardín eliminado con éxito');
                fetchGardens(); // Recarga la lista de jardines
              } else {
                throw new Error('Error al eliminar el jardín');
              }
            } catch (error) {
              console.error('Error al eliminar el jardín:', error);
              Alert.alert('Error', 'Hubo un problema al eliminar el jardín');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Jardines Virtuales</Text>

      <CustomInput
        label="Nombre del Jardín"
        placeholder="Ingrese el nombre del jardín"
        value={gardenName}
        onChangeText={setGardenName}
      />

      <CustomInput
        label="Descripción (opcional)"
        placeholder="Ingrese una descripción"
        value={gardenDescription}
        onChangeText={setGardenDescription}
      />

      <Button
        title={isEditing ? 'Editar Jardín' : 'Crear Jardín'}
        onPress={isEditing ? handleEditGarden : handleCreateGarden}
      />

      <FlatList
        data={gardens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.gardenItem}>
            <Text>{item.name}</Text>
            <Text>{item.description}</Text>
            <Button title="Editar" onPress={() => {
              setGardenName(item.name);
              setGardenDescription(item.description);
              setIsEditing(true);
              setEditingId(item.id);
            }} />
            <Button title="Eliminar" onPress={() => handleDeleteGarden(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  gardenItem: { marginBottom: 16, padding: 12, borderWidth: 1, borderRadius: 8 },
});

export default Gardens;
