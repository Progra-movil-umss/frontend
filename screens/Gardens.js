import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import CardGarden from '../components/CardGarden';
import BottomSheetModal from '../components/BottomSheetModal';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../core/AuthContext';

const EmptyStateIcon = () => (
  <Svg
    width={64}
    height={64}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#939393"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M17 17v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4h8" />
    <Path d="M11.9 7.908a6 6 0 0 0-4.79-4.806" />
    <Path d="M3 3v2a6 6 0 0 0 6 6h2" />
    <Path d="M13.531 8.528A6 6 0 0 1 18 5h3v1a6 6 0 0 1-5.037 5.923" />
    <Path d="M12 15v-3" />
    <Path d="M3 3l18 18" />
  </Svg>
);

const Gardens = ({ navigation, route }) => {
  const { accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGarden, setSelectedGarden] = useState(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reloadToggle, setReloadToggle] = useState(false);
  const [confirmEditVisible, setConfirmEditVisible] = useState(false);

  const { data, loading, error } = useFetch(
    `https://florafind-aau6a.ondigitalocean.app/gardens?reload=${reloadToggle}`,
    accessToken
  );

  const gardens = data?.items || [];

  useEffect(() => {
    if (!accessToken) {
      Alert.alert('Error', 'No se ha encontrado el token de acceso');
      setLoading(false);
      return;
    }

    const fetchGardens = async () => {
      try {
        const { data } = await apiFetch('/gardens', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setGardens(data.items || []);
      } catch (e) {
        setError('No se pudieron cargar los jardines');
      } finally {
        setLoading(false);
      }
    };

    fetchGardens();
  }, [accessToken]);

  useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    setReloadToggle((prev) => !prev);
  });
  return unsubscribe;
}, [navigation]);

  const openOptions = (garden) => {
    setSelectedGarden(garden);
    setModalVisible(true);
  };

  const closeOptionsModal = () => {
    setModalVisible(false);
  };

  const openConfirmEdit = () => {
    setModalVisible(false);
  };

  const closeConfirmEdit = () => {
    setConfirmEditVisible(false);
    setSelectedGarden(null);
  };

  const openConfirmDelete = () => {
    setModalVisible(false);
    setConfirmDeleteVisible(true);
  };

  const closeConfirmDelete = () => {
    setConfirmDeleteVisible(false);
    setSelectedGarden(null);
  };

  const handleDeleteGarden = async () => {
    if (!selectedGarden) {
      console.log('[DEBUG] No hay jardín seleccionado para eliminar');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `https://florafind-aau6a.ondigitalocean.app/gardens/${selectedGarden.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Error al eliminar el jardín: ${response.status}`
        );
      }

      const json = await response.json();

      Alert.alert('Éxito', json.message || 'Jardín eliminado correctamente');

      // Forzar recarga de jardines aumentando toggle
      setReloadToggle((prev) => !prev);

      setConfirmDeleteVisible(false);
      setSelectedGarden(null);
    } catch (err) {
      Alert.alert('Error', err.message || 'Error al eliminar el jardín');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
  if (!selectedGarden) return;
  setConfirmEditVisible(false); // Cerrar modal de confirmación
  setModalVisible(false);        // Asegurar cerrar modal de opciones (por si acaso)
  navigation.navigate('CreateGarden', { gardenToEdit: selectedGarden });
};


  const handleGardenPress = (garden) => {
    console.log('Navegando a Plants con garden:', garden);
    navigation.navigate('Plants', {
      gardenId: garden.id,
      gardenName: garden.name,
    });
  };

  const modalOptions = [
    { label: 'Editar', onPress: () => {
      setModalVisible(false);
      navigation.navigate('CreateGarden', { gardenToEdit: selectedGarden });
    }},
    { label: 'Eliminar', onPress: openConfirmDelete, destructive: true },
  ];


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.loadingText}>Cargando jardines...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.errorText}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }, { paddingTop: insets.top }]}> 
      <Text style={styles.title}>Tus Jardines</Text>
      {gardens.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Aún no tienes jardines añadidos, crea uno para empezar
          </Text>
          <CardGarden gardens={[]} onCreatePress={() => navigation.navigate('CreateGarden')} />
        </View>
      ) : (
        <CardGarden
          gardens={gardens}
          onCreatePress={() => navigation.navigate('CreateGarden')}
          onGardenPress={handleGardenPress}
          onOptionsPress={openOptions}
        />
      )}

      <BottomSheetModal
        visible={modalVisible}
        onClose={closeOptionsModal}
        title={selectedGarden ? selectedGarden.name : 'Opciones'}
        options={modalOptions}
      />
      {/* Modal para confirmar edición */}
      <Modal
        visible={confirmEditVisible}
        transparent
        animationType="fade"
        onRequestClose={closeConfirmEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirmar edición</Text>
            <Text style={styles.confirmMessage}>¿Estás seguro de editar el jardín?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={closeConfirmEdit}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleEdit}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal para confirmar eliminación */}
      <Modal
        visible={confirmDeleteVisible}
        transparent
        animationType="fade"
        onRequestClose={closeConfirmDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirmar eliminación</Text>
            <Text style={styles.confirmMessage}>
              ¿Estás seguro de eliminar el jardín{' '}
              <Text style={{ fontWeight: 'bold' }}>{selectedGarden?.name}</Text>?
            </Text>

            {deleting ? (
              <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={closeConfirmDelete}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeleteGarden}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4, textAlign:"center" },
  subTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12, color: '#333' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#939393', textAlign: 'center' },
  loadingText: { fontSize: 16, color: '#4CAF50', textAlign: 'center' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
  },
  confirmTitle: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', marginBottom: 16, textAlign: 'center' },
  confirmMessage: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 24 },
  confirmButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  button: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12, minWidth: 120 },
  cancelButton: { backgroundColor: '#eee' },
  cancelButtonText: { color: '#333', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  editButton: { backgroundColor: '#4CAF50' },
  editButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  deleteButton: { backgroundColor: '#ff4d4d' },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
});

export default Gardens;
