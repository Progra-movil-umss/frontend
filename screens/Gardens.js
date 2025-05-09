import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para el ícono SVG
import CustomInput from '../components/CustomInput'; // Tu componente de entrada personalizado

const Gardens = ({ route, navigation }) => {
  const { accessToken } = route.params || {}; // Obtener el token de acceso

  const [gardens, setGardens] = useState([]);  // Lista de jardines
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    if (accessToken) {
      fetchGardens();
    } else {
      Alert.alert('Error', 'No se ha encontrado el token de acceso');
    }
  }, [accessToken]);

  const fetchGardens = async () => {
    try {
      const response = await fetch('https://tu-api.com/gardens', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.items) {
        setGardens(data.items);  // Actualizar estado con los jardines
      }
    } catch (error) {
      console.error('Error al obtener jardines:', error);
    } finally {
      setLoading(false);  // Finalizar estado de carga
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="leaf" size={24} color="#939393" />
      <Text style={styles.emptyText}>Aún no tienes jardines añadidos</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateGarden')}
      >
        <Text style={styles.createButtonText}>CREAR JARDÍN</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Jardines Virtuales</Text>

      {loading ? (
        <Text>Cargando jardines...</Text>  // Mensaje de carga mientras se obtienen los jardines
      ) : gardens.length === 0 ? (
        renderEmptyState()  // Mostrar mensaje si no hay jardines
      ) : (
        <FlatList
          data={gardens}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.gardenItem}>
              <Text style={styles.gardenName}>{item.name}</Text>
              <Text>{item.description}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  gardenItem: { marginBottom: 16, padding: 12, borderWidth: 1, borderRadius: 8 },
  gardenName: { fontWeight: 'bold', fontSize: 18 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#939393', marginVertical: 10 },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default Gardens;
