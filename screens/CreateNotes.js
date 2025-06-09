import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '../core/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const COLORS = ['#F2F5A9', '#42BDFF', '#A6DEB7', '#DEBF8E', '#FFADA6'];

const CreateNotes = ({ route, navigation }) => {
  const { plantId, plantName, note } = route.params;
  const { accessToken } = useAuth();

  const [text, setText] = useState(note?.text || '');
  const [selectedColor, setSelectedColor] = useState(note?.color || COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    console.log('[CreateNotes] Modo:', note ? 'Editar nota existente' : 'Crear nueva nota');
    if (note) console.log('[CreateNotes] Nota recibida para edición:', note);
  }, [note]);

  const validateNote = () => {
    if (!text.trim()) {
      Alert.alert('Error', 'La nota no puede estar vacía');
      return false;
    }
    if (text.length > 500) {
      Alert.alert('Error', 'La nota no puede tener más de 500 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setConfirmModalVisible(false);
    setLoading(true);

    const observation_date = new Date().toISOString();
    const body = {
      text: text.trim(),
      observation_date,
      color: selectedColor,
    };

    const url = note
        ? `https://florafind-aau6a.ondigitalocean.app/plants/notes/${note.id}`
        : `https://florafind-aau6a.ondigitalocean.app/plants/${plantId}/notes`;

    const method = note ? 'PUT' : 'POST';

    console.log(`[CreateNotes] Enviando ${method} a:`, url);
    console.log('[CreateNotes] Datos enviados:', body);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('[CreateNotes] Respuesta del backend:', data);

      if (response.ok) {
        setModalVisible(true);
      } else {
        throw new Error(data.detail || 'Error al guardar la nota');
      }
    } catch (err) {
      console.error('[CreateNotes] Error:', err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModalAndRedirect = () => {
    setModalVisible(false);
    navigation.navigate('PlantNotes', { plantId, plantName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{note ? 'Editar Nota' : `Nueva Nota para ${plantName}`}</Text>

      <Text style={styles.label}>Contenido de la nota</Text>
      <TextInput
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Escribe tu nota aquí..."
        style={styles.textInput}
        maxLength={500}
      />

      <Text style={styles.label}>Color de la nota</Text>
      <View style={styles.colorPickerContainer}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorCircle, { backgroundColor: color }, selectedColor === color && styles.selectedCircle]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.7 }]}
        onPress={() => {
          if (validateNote()) setConfirmModalVisible(true);
        }}
        disabled={loading}
      >
        <Text style={styles.submitText}>{loading ? 'Guardando...' : note ? 'Guardar cambios' : 'Crear nota'}</Text>
      </TouchableOpacity>

      {/* Modal de confirmación */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="help-circle" size={64} color="#4CAF50" />
            <Text style={styles.modalText}>¿Deseas {note ? 'guardar los cambios' : 'crear la nota'}?</Text>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc', marginRight: 10 }]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                onPress={handleSubmit}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal final */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModalAndRedirect}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.modalText}>
              {note ? 'Nota actualizada con éxito' : 'Nota creada con éxito'}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModalAndRedirect}>
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 120,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedCircle: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  submitButton: {
    marginTop: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    color: '#4CAF50',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
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

export default CreateNotes;
