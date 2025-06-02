import React, { useState } from 'react';
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

const defaultImgPlant = require('../assets/defaultPlant.png');

const PlantDetails = ({ route, navigation }) => {
  const { plant: plantParam } = route.params;
  const { accessToken } = useAuth(); // Aquí se obtiene el token

  // Estado local para poder actualizar la planta sin recargar toda la pantalla
  const [plant, setPlant] = useState(plantParam);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('plantUpdated', (e) => {
  //     const updatedPlant = e.data.plant;
  //     setPlant(updatedPlant);
  //   });

  //   return unsubscribe;
  // }, [navigation]);

  const goToEdit = () => {
  navigation.navigate('EditPlant', {
    plant,
    gardenId: plant.garden_id,          // PASAR gardenId
    gardenName: plant.garden_name || '', // PASAR nombre jardín si tienes (o string vacío)
    onUpdate: (updatedPlant) => {
      setPlant(updatedPlant);
    },
  });
};


  // Función para eliminar planta
  const handleDelete = () => {
  Alert.alert(
    'Confirmar eliminación',
    `¿Deseas eliminar la planta "${plant.alias || 'sin nombre'}"?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          Alert.alert('Info', 'Eliminando planta...'); // Debug básico
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
                  onPress: () => {
                    navigation.navigate('Plants', { refresh: true });
                  },
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
};

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

        {/* Botones al pie */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            activeOpacity={0.7}
            onPress={goToEdit}
          >
            <Text style={styles.editButtonText}>Editar planta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            activeOpacity={0.7}
            onPress={handleDelete}
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
    // borderBottomLeftRadius: 24,
    // borderBottomRightRadius: 24,
  },
  card: {
    marginTop: 20,
    marginHorizontal: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    // Sombra suave para iOS
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    // Elevation para Android
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
