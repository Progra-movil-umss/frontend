import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../core/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../components/BottomSheetModal';

const PlantNotes = ({ route, navigation }) => {
  const { plantId, plantName } = route.params;
  const { accessToken } = useAuth();

  const url = `https://florafind-aau6a.ondigitalocean.app/plants/${plantId}/notes`;
  const { data, loading, error, refetch } = useFetch(url, accessToken);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ visible: false, success: true, message: '' });

  const openOptions = (note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const closeOptionsModal = () => {
    setModalVisible(false);
  };

  const handleEditNote = () => {
    const note = selectedNote;
    closeOptionsModal();
    if (!note) {
      console.warn('[PlantNotes] No hay nota seleccionada');
      return;
    }
    console.log('[PlantNotes] Editar nota:', note);

    navigation.navigate('CreateNotes', {
      plantId,
      plantName,
      note,
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `https://florafind-aau6a.ondigitalocean.app/plants/notes/${selectedNote.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      const result = await response.json();
      console.log('[PlantNotes] Respuesta al eliminar:', result);

      if (response.ok) {
        setFeedbackModal({ visible: true, success: true, message: 'Nota eliminada exitosamente' });
        refetch();
      } else {
        throw new Error(result.detail || 'Error al eliminar la nota');
      }
    } catch (err) {
      console.error('[PlantNotes] Error al eliminar:', err.message);
      setFeedbackModal({ visible: true, success: false, message: err.message });
    } finally {
      setDeleteConfirmVisible(false);
    }
  };

  const handleDeleteNote = () => {
    closeOptionsModal();
    if (!selectedNote) {
      console.warn('[PlantNotes] No hay nota seleccionada');
      return;
    }
    setDeleteConfirmVisible(true);
  };

  useEffect(() => {
    console.log('[PlantNotes] ID:', plantId);
  }, [plantId]);

  const renderItem = ({ item }) => (
    <View style={[styles.noteCard, { backgroundColor: item.color || '#F2F5A9' }]}>
      <TouchableOpacity
        style={styles.optionsButton}
        onPress={() => openOptions(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#4CAF50" />
      </TouchableOpacity>

      <Text style={styles.noteText}>{item.text}</Text>
      <Text style={styles.noteDate}>
        {new Date(item.observation_date).toLocaleString('es-BO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notas de {plantName}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.errorText}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Text>
      ) : data?.length > 0 ? (
        <View>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
          <BottomSheetModal
            visible={modalVisible}
            onClose={closeOptionsModal}
            title="Opciones de nota"
            options={[
              { label: 'Editar', onPress: handleEditNote },
              { label: 'Eliminar', onPress: handleDeleteNote, destructive: true },
            ]}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            Aún no tienes notas creadas para esta planta
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('CreateNotes', { plantId, plantName })}
      >
        <Ionicons name="add" size={28} color="#000" />
      </TouchableOpacity>

      {/* Modal confirmación eliminación */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={64} color="#f44336" />
            <Text style={styles.modalText}>¿Estás seguro que deseas eliminar esta nota?</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setDeleteConfirmVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonDelete} onPress={confirmDelete}>
                <Text style={styles.modalButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal feedback */}
      <Modal
        visible={feedbackModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name={feedbackModal.success ? 'checkmark-circle' : 'close-circle'}
              size={64}
              color={feedbackModal.success ? '#4CAF50' : '#f44336'}
            />
            <Text style={styles.modalText}>{feedbackModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButtonDelete}
              onPress={() => setFeedbackModal({ ...feedbackModal, visible: false })}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 16,
  },
  noteCard: {
    position: 'relative',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: '#F2F5A9',
    padding: 16,
    borderRadius: 32,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  optionsButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 20,
    color: '#444',
    textAlign: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  modalButtonDelete: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PlantNotes;
