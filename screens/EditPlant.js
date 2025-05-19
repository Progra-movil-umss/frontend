import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../AuthContext';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const defaultImgPlant = require('../assets/defaultPlant.png');

const EditPlant = ({ route, navigation }) => {
  const { plant } = route.params;
  const { accessToken } = useAuth();

  const [alias, setAlias] = useState(plant.alias || '');
  const [image, setImage] = useState(
    plant.image_url && plant.image_url !== 'null' ? plant.image_url : null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validar tamaño de imagen
  const validateImageSize = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.size && fileInfo.size > MAX_IMAGE_SIZE) {
        Alert.alert(
          'Error',
          `La imagen es demasiado pesada (${(fileInfo.size / 1024 / 1024).toFixed(
            2
          )} MB). Máximo permitido: 5 MB.`
        );
        return false;
      }
      return true;
    } catch {
      Alert.alert('Error', 'No se pudo validar el tamaño de la imagen.');
      return false;
    }
  };

  // Selección de imagen
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permiso necesario',
        'Se requiere permiso para acceder a la galería de imágenes.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const isValid = await validateImageSize(uri);
      if (isValid) {
        setImage(uri);
      }
    }
  };

  // Obtener mimeType por extensión
  const getMimeType = (ext) => {
    switch (ext.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'image/jpeg';
    }
  };

  // Guardar cambios
    const handleSaveChanges = async () => {
  if (!alias.trim()) {
    Alert.alert('Error', 'El alias es obligatorio');
    return;
  }

  const formData = new FormData();
  formData.append('alias', alias.trim());

  if (image && !image.startsWith('http')) {
    const fileType = image.split('.').pop();
    let localUri = image;
    if (!localUri.startsWith('file://')) {
      localUri = 'file://' + localUri;
    }
    formData.append('image', {
      uri: localUri,
      name: `plant_image.${fileType}`,
      type: getMimeType(fileType),
    });
  }

  console.log('Datos a enviar en formData:');
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}:`, pair[1]);
  }

  try {
    const response = await fetch(
      `https://florafind-aau6a.ondigitalocean.app/gardens/plants/${plant.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          // No configures Content-Type manual para que fetch lo gestione
        },
        body: formData,
      }
    );

    if (!response.ok) {
      let errorMsg = 'Error en la actualización';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || JSON.stringify(errorData);
      } catch {
        try {
          errorMsg = await response.text();
        } catch {}
      }
      throw new Error(errorMsg);
    }

    if (route.params.onUpdate) {
      route.params.onUpdate({
        ...plant,
        alias: alias.trim(),
        image_url: image && !image.startsWith('http') ? image : plant.image_url,
      });
    }

    Alert.alert('Éxito', 'Planta actualizada correctamente', [
    {
        text: 'Aceptar',
        onPress: () => {
        navigation.goBack();

        navigation.emit({
            type: 'plantUpdated',
            data: {
            plant: {
                ...plant,
                alias: alias.trim(),
                image_url: image && !image.startsWith('http') ? image : plant.image_url,
            },
            },
        });
        },
    },
    ]);

  } catch (error) {
    console.error('Error en handleSaveChanges:', error);
    Alert.alert('Error', error.message || 'Error al guardar los cambios');
  }
};




  // Cerrar modal y volver a PlantDetails con actualización
  const onModalClose = () => {
    setModalVisible(false);
    // Regresar y refrescar detalles, enviando datos actualizados
    navigation.replace('PlantDetails', {
      plant: { ...plant, alias, image_url: image },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Planta</Text>

      <Text style={styles.label}>Alias</Text>
      <TextInput
        style={styles.input}
        value={alias}
        onChangeText={setAlias}
        placeholder="Ingrese alias"
      />

      <Text style={[styles.label, { marginTop: 24 }]}>Imagen</Text>
      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        <Text style={styles.imagePickerText}>Seleccionar Imagen</Text>
      </TouchableOpacity>

      {image ? (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      ) : (
        <Image source={defaultImgPlant} style={styles.imagePreview} />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveChanges}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para mensaje de éxito */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={onModalClose}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Planta actualizada con éxito</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={onModalClose}
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
  },
  imagePickerButton: {
    marginVertical: 12,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  errorText: {
    color: '#E53935',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop: 32,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 7,
  },
  modalText: {
    fontSize: 20,
    color: '#4CAF50',
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditPlant;
