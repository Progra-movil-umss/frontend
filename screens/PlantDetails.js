// PlantDetails.js (modificado)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../core/AuthContext';
import BotanicalGuide from '../components/BotanicalGuide';

const defaultImgPlant = require('../assets/defaultPlant.png');

const PlantDetails = ({ route, navigation }) => {
  const { plant: plantParam } = route.params;
  const { accessToken } = useAuth();

  const [plant, setPlant] = useState(plantParam);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Estado para la info de Wikipedia
  const [wikiData, setWikiData] = useState(null);
  const [loadingWiki, setLoadingWiki] = useState(true);
  const [errorWiki, setErrorWiki] = useState(null);

  useEffect(() => {
    const fetchWikipediaData = async () => {
      if (!plant.scientific_name_without_author) {
        setLoadingWiki(false);
        setWikiData(null);
        return;
      }
      setLoadingWiki(true);
      setErrorWiki(null);
      try {
        const encodedName = encodeURIComponent(plant.scientific_name_without_author);
        const response = await fetch(
          `https://florafind-aau6a.ondigitalocean.app/plants/wikipedia/${encodedName}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          }
        );
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Error al obtener información botánica');
        }
        const data = await response.json();
        setWikiData(data);
      } catch (error) {
        setErrorWiki(error.message || 'Error al cargar datos botánicos');
        setWikiData(null);
      } finally {
        setLoadingWiki(false);
      }
    };

    fetchWikipediaData();
  }, [plant.scientific_name_without_author, accessToken]);

  // Funciones y UI existentes para eliminar, editar, etc (igual que antes)...

  // ... OMITO para brevedad, usar todo el código original para esas funciones, botones y estilos.

  const imageUrl =
    plant.image_url && plant.image_url !== 'null'
      ? { uri: plant.image_url }
      : defaultImgPlant;

  return (
    <View style={styles.container}>
      {/* Header con botón atrás y título */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={28} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plant.alias || 'Detalle de Planta'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={imageUrl} style={styles.image} resizeMode="cover" />

        {/* Info básica planta (igual que antes) */}
        <View style={styles.card}>
          {/* Nombre */}
          <View style={styles.infoSection}>
            <Ionicons name="pricetag-outline" size={22} color="#7986CB" style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.sectionLabel}>Nombre:</Text>
              <Text style={styles.sectionText}>{plant.alias || 'Sin nombre'}</Text>
            </View>
          </View>

          {/* Nombre científico */}
          <View style={styles.infoSection}>
            <Ionicons name="leaf-outline" size={22} color="#7986CB" style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.sectionLabel}>Nombre científico:</Text>
              <Text style={styles.sectionText}>
                {plant.scientific_name_without_author || 'No disponible'}
              </Text>
            </View>
          </View>

          {/* Familia */}
          <View style={styles.infoSection}>
            <Ionicons name="git-network-outline" size={22} color="#7986CB" style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.sectionLabel}>Familia</Text>
              <Text style={styles.sectionText}>{plant.family || 'No disponible'}</Text>
            </View>
          </View>

          {/* Género */}
          <View style={styles.infoSection}>
            <Ionicons name="flower-outline" size={22} color="#7986CB" style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.sectionLabel}>Género</Text>
              <Text style={styles.sectionText}>{plant.genus || 'No disponible'}</Text>
            </View>
          </View>

          {/* Nombres comunes */}
          <View style={styles.infoSection}>
            <Ionicons name="list-outline" size={22} color="#7986CB" style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.sectionLabel}>Nombres comunes</Text>
              <Text style={styles.sectionText}>
                {plant.common_names && plant.common_names.length > 0
                  ? plant.common_names.join(', ')
                  : 'Ninguno'}
              </Text>
            </View>
          </View>

          {/* Fecha de creación */}
          <View style={styles.infoSection}>
            <Ionicons name="calendar-outline" size={22} color="#7986CB" style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.sectionLabel}>Fecha de creación</Text>
              <Text style={styles.sectionText}>
                {plant.created_at
                  ? new Date(plant.created_at).toLocaleDateString()
                  : 'No disponible'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sección Wikipedia / BotanicalGuide */}
        {loadingWiki ? (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={{ marginTop: 8, color: '#4CAF50' }}>Cargando información botánica...</Text>
          </View>
        ) : errorWiki ? (
          <View style={{ marginTop: 20, paddingHorizontal: 24 }}>
            <Text style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>
              {errorWiki}
            </Text>
          </View>
        ) : (
          wikiData && <BotanicalGuide guideData={wikiData} />
        )}

        {/* Botones Editar y Eliminar planta */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('EditPlant', {
                plant,
                gardenId: plant.garden_id,
                gardenName: plant.garden_name || '',
                onUpdate: (updatedPlant) => setPlant(updatedPlant),
              })
            }
          >
            <Text style={styles.editButtonText}>Editar planta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                'Confirmar eliminación',
                `¿Deseas eliminar la planta "${plant.alias || 'sin nombre'}"?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        setLoadingDelete(true);
                        const response = await fetch(
                          `https://florafind-aau6a.ondigitalocean.app/gardens/plants/${plant.id}`,
                          {
                            method: 'DELETE',
                            headers: {
                              Authorization: `Bearer ${accessToken}`,
                              Accept: 'application/json',
                            },
                          }
                        );
                        const data = await response.json();

                        if (response.ok) {
                          Alert.alert('Éxito', data.message || 'Planta eliminada correctamente', [
                            {
                              text: 'Aceptar',
                              onPress: () => navigation.navigate('Plants', { refresh: true }),
                            },
                          ]);
                        } else {
                          throw new Error(data.detail || 'Error eliminando planta');
                        }
                      } catch (error) {
                        Alert.alert('Error', error.message || 'No se pudo eliminar la planta');
                      } finally {
                        setLoadingDelete(false);
                      }
                    },
                  },
                ]
              );
            }}
            disabled={loadingDelete}
          >
            {loadingDelete ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Eliminar planta</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },
  backButton: { marginRight: 16 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    flexShrink: 1,
  },
  scrollContent: { paddingBottom: 40 },
  image: {
    width: '100%',
    height: 280,
  },
  card: {
    marginTop: 20,
    marginHorizontal: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  icon: {
    marginRight: 14,
    marginTop: 3,
  },
  infoTextContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flexShrink: 1,
  },
  buttonsContainer: {
    marginTop: 36,
    marginHorizontal: 16,
    marginBottom: 30,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#E53935',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PlantDetails;
