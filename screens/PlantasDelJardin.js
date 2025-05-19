import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { useAuth } from '../core/AuthContext';

const PlantasDelJardin = ({ route, navigation }) => {
  const { garden } = route.params;
  const { accessToken } = useAuth();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch(`https://florafind-aau6a.ondigitalocean.app/gardens/${garden.id}/plants`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        setPlants(data.items || []);
      } catch (e) {
        setPlants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, [garden.id, accessToken]);

  // Selección múltiple de plantas
  const handlePlantPress = (plant) => {
    if (selectedPlants.length > 0) {
      // Si ya hay selección, alterna selección
      if (selectedPlants.some(p => p.id === plant.id)) {
        setSelectedPlants(selectedPlants.filter(p => p.id !== plant.id));
      } else {
        setSelectedPlants([...selectedPlants, plant]);
      }
    } else {
      // Si no hay selección, entra a configurar alarma para esa planta
      navigation.navigate('ConfigurarAlarma', { garden, plant });
    }
  };

  const handlePlantLongPress = (plant) => {
    if (!selectedPlants.some(p => p.id === plant.id)) {
      setSelectedPlants([...selectedPlants, plant]);
    }
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }]}>
      <Text style={styles.title}>Plantas de {garden.name}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : plants.length === 0 ? (
        <Text style={styles.emptyText}>No hay plantas en este jardín.</Text>
      ) : (
        <>
          <FlatList
            data={plants}
            numColumns={2}
            columnWrapperStyle={styles.row}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.plantItem, selectedPlants.some(p => p.id === item.id) && { borderColor: '#388e3c', borderWidth: 3, backgroundColor: '#c8e6c9' }]}
                onPress={() => handlePlantPress(item)}
                onLongPress={() => handlePlantLongPress(item)}
              >
                <Image source={{ uri: item.image_url }} style={styles.plantImage} />
                <Text style={styles.plantName}>{item.alias || item.scientific_name_without_author}</Text>
                <Text style={styles.plantDesc}>{item.common_names?.join(', ')}</Text>
                {selectedPlants.some(p => p.id === item.id) && (
                  <Text style={{ position: 'absolute', top: 8, right: 8, color: '#388e3c', fontWeight: 'bold' }}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
          {selectedPlants.length > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: '#4CAF50',
                borderRadius: 8,
                paddingVertical: 14,
                marginTop: 16,
                marginBottom: 8,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                alignSelf: 'center',
                elevation: 2,
              }}
              onPress={() => navigation.navigate('ConfigurarAlarma', { garden, plant: selectedPlants })}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                Crear alarma para {selectedPlants.length} planta(s)
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#4CAF50' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  plantItem: { flex: 1, backgroundColor: '#e7f6e9', borderRadius: 10, padding: 10, margin: 4, alignItems: 'center', maxWidth: '48%' },
  plantImage: { width: 80, height: 80, borderRadius: 10, marginBottom: 8 },
  plantName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  plantDesc: { color: '#666', fontSize: 13, textAlign: 'center' },
  emptyText: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 40 },
});

export default PlantasDelJardin;
