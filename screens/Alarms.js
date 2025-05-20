import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Platform, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as AlarmModule from 'expo-alarm-module';
import { useAuth } from '../core/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../core/api';

const Alarms = ({ navigation }) => {
  const { accessToken } = useAuth();
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGardens, setSelectedGardens] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState([]);
  const [showPlantSelector, setShowPlantSelector] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (accessToken) fetchGardens();
  }, [accessToken]);

  const fetchGardens = async () => {
    try {
      const { data } = await apiFetch('/gardens', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setGardens(data.items || []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los jardines');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async (gardenId) => {
    try {
      const { data } = await apiFetch(`/gardens/${gardenId}/plants`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPlants(data.items || []);
      setShowPlantSelector(true);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar las plantas');
    }
  };

  const handleGardenPress = (garden) => {
    if (selectedGardens.length > 0) {
      if (selectedGardens.some(g => g.id === garden.id)) {
        setSelectedGardens(selectedGardens.filter(g => g.id !== garden.id));
      } else {
        setSelectedGardens([...selectedGardens, garden]);
      }
    } else {
      navigation.navigate('PlantasDelJardin', { garden });
    }
  };

  const handleGardenLongPress = (garden) => {
    if (!selectedGardens.some(g => g.id === garden.id)) {
      setSelectedGardens([...selectedGardens, garden]);
    }
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }]}>
      <Text style={styles.title}>Selecciona uno o varios jardines</Text>
      {loading ? (
        <Text>Cargando jardines...</Text>
      ) : gardens.length === 0 ? (
        <Text>No tienes jardines registrados.</Text>
      ) : (
        <FlatList
          data={gardens}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.gardenRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.gardenItemGrid, selectedGardens.some(g => g.id === item.id) && { borderColor: '#388e3c', borderWidth: 3, backgroundColor: '#c8e6c9' }]}
              onPress={() => handleGardenPress(item)}
              onLongPress={() => handleGardenLongPress(item)}
            >
              {item.image_url ? (
                <View style={{ width: '100%', position: 'relative', flex: 1 }}>
                  <Image source={{ uri: item.image_url }} style={styles.gardenImageGrid} />
                  <View style={styles.gardenTextOverlay}>
                    <Text style={styles.gardenName}>{item.name}</Text>
                    <Text style={styles.gardenDesc}>{item.description}</Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.gardenImageGrid, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' }]}>
                  <MaterialCommunityIcons name="flower" size={40} color="#A5A5A5" />
                </View>
              )}
              {selectedGardens.some(g => g.id === item.id) && (
                <Ionicons name="checkmark-circle" size={24} color="#388e3c" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }} />
              )}
            </TouchableOpacity>
          )}
        />
      )}
      {selectedGardens.length > 0 && (
        <TouchableOpacity style={[styles.saveButton, { marginTop: 10 }]} onPress={() => navigation.navigate('ConfigurarAlarma', { garden: selectedGardens })}>
          <Text style={styles.saveButtonText}>Crear recordatorio para {selectedGardens.length} jardín(es)</Text>
        </TouchableOpacity>
      )}
      {showPlantSelector && (
        <Modal visible={showPlantSelector} animationType="slide" transparent={true} onRequestClose={() => setShowPlantSelector(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona una planta</Text>
              {plants.length === 0 ? (
                <Text>No hay plantas en este jardín.</Text>
              ) : (
                <FlatList
                  data={plants}
                  keyExtractor={item => item.id}
                  style={{ maxHeight: 320, width: '100%' }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.plantItem} onPress={() => {
                      if (selectedPlant && selectedPlant.some(p => p.id === item.id)) {
                        setSelectedPlant(selectedPlant.filter(p => p.id !== item.id));
                      } else {
                        setSelectedPlant([...(selectedPlant || []), item]);
                      }
                    }}>
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.plantImage} />
                      ) : (
                        <View style={[styles.plantImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' }]}>
                          <MaterialCommunityIcons name="leaf" size={24} color="#A5A5A5" />
                        </View>
                      )}
                      <View style={styles.plantTextOverlay}>
                        <Text style={styles.plantName}>{item.alias || item.scientific_name_without_author}</Text>
                        <Text style={styles.plantDesc}>{item.common_names?.join(', ')}</Text>
                      </View>
                      {selectedPlant && selectedPlant.some(p => p.id === item.id) && (
                        <Ionicons name="checkmark-circle" size={22} color="#388e3c" style={{ marginLeft: 8 }} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPlantSelector(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            {selectedPlant && selectedPlant.length > 0 && (
              <TouchableOpacity
                style={styles.floatingSaveButton}
                onPress={() => {
                  setShowPlantSelector(false);
                  navigation.navigate('ConfigurarAlarma', { plant: selectedPlant });
                }}
              >
                <Text style={styles.saveButtonText}>Crear recordatorio para {selectedPlant.length} planta(s)</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, /* padding: 16, */ backgroundColor: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff', // Siempre blanco para máxima legibilidad
  },
  gardenRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  gardenItemGrid: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 6,
    alignItems: 'center',
    maxWidth: '48%',
    // Sombra sutil
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  gardenImageGrid: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
    minHeight: 120,
    maxHeight: 160,
  },
  gardenTextOverlay: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  gardenName: {
    fontSize: 17,
    color: '#fff', // Siempre blanco para máxima legibilidad
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gardenDesc: {
    color: '#fff', // Siempre blanco para máxima legibilidad
    fontSize: 13,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 10, alignItems: 'stretch', width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  saveButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginTop: 20, width: '100%' },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: { marginTop: 10 },
  cancelButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    padding: 0,
    overflow: 'hidden',
  },
  plantImage: {
    width: 70,
    height: 70,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#e0e0e0',
  },
  plantTextOverlay: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // Siempre blanco para máxima legibilidad
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  plantDesc: {
    color: '#fff', // Siempre blanco para máxima legibilidad
    fontSize: 13,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  floatingSaveButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 32,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 20,
  },
});

export default Alarms;
