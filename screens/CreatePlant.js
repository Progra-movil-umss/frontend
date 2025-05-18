// CreatePlant.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import CustomInput from '../components/CustomInput';
import { useFetchPost } from '../hooks/useFetchPost';
import { useAuth } from '../AuthContext';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const CreatePlant = ({ route, navigation }) => {
  const { gardenId, gardenName } = route.params;
  const { accessToken } = useAuth();
  const { loading, error: postError, post } = useFetchPost(accessToken);

  const [alias, setAlias] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [genus, setGenus] = useState('');
  const [family, setFamily] = useState('');
  const [commonNamesText, setCommonNamesText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const validateImageSize = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.size && fileInfo.size > MAX_IMAGE_SIZE) {
        setError(`La imagen es demasiado pesada (${(fileInfo.size / 1024 / 1024).toFixed(2)} MB). Máximo permitido: 5 MB.`);
        return false;
      }
      setError(null);
      return true;
    } catch {
      setError('No se pudo validar el tamaño de la imagen.');
      return false;
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso necesario', 'Se requiere permiso para acceder a la galería de imágenes');
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
        setImageUri(uri);
      }
    }
  };

  const handleSubmit = async () => {
    // Validaciones simples
    if (!alias.trim()) {
      Alert.alert('Error', 'El alias (nombre común) es obligatorio');
      return;
    }
    if (!scientificName.trim()) {
      Alert.alert('Error', 'El nombre científico es obligatorio');
      return;
    }
    if (!genus.trim()) {
      Alert.alert('Error', 'El género es obligatorio');
      return;
    }
    if (!family.trim()) {
      Alert.alert('Error', 'La familia es obligatoria');
      return;
    }
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    // Preparar body
    const body = {
      alias: alias.trim(),
      scientific_name_without_author: scientificName.trim(),
      genus: genus.trim(),
      family: family.trim(),
      common_names: commonNamesText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0),
      image_url: '', // Se asignará después
    };

    // Si hay imagen, se debe subir a algún servicio externo y obtener URL.
    // Pero la API pide URL, y en CreateGarden sólo se sube formData con archivo.
    // Aquí asumo que backend acepta solo URL, por lo que si hay imagen local, se debería subir a un storage (ej. Cloudinary).
    // Como no tenemos API para upload, podemos simular y no subir imagen.
    // Por lo tanto, para este ejemplo, si hay imagen, pediremos que el usuario pegue una URL o dejar vacía.
    // Alternativamente, dejar image_url vacío y solo enviar campos.

    if (imageUri) {
      Alert.alert(
        'Advertencia',
        'La imagen local no se sube automáticamente. Por favor proporciona una URL de imagen en otro campo si deseas que la planta tenga imagen.',
      );
      // Opcionalmente, podrías implementar la subida a un servidor o Cloudinary aquí.
    }

    try {
      // Enviar POST con JSON
      await post(`https://florafind-aau6a.ondigitalocean.app/gardens/${gardenId}/plants`, body);
      setModalVisible(true);
    } catch (err) {
      console.error('Error creando planta:', err);
      if (err.body?.detail) {
        Alert.alert('Error', JSON.stringify(err.body.detail));
      } else {
        Alert.alert('Error', 'Hubo un problema al crear la planta');
      }
    }
  };

  const closeModalAndGoBack = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Agregar Planta a {gardenName}</Text>

      <CustomInput
        label="Alias (nombre común)"
        placeholder="Ej: Rosa, Cactus"
        value={alias}
        onChangeText={setAlias}
      />
      <CustomInput
        label="Nombre Científico sin autor"
        placeholder="Ej: Rosa rubiginosa"
        value={scientificName}
        onChangeText={setScientificName}
      />
      <CustomInput
        label="Género"
        placeholder="Ej: Rosa"
        value={genus}
        onChangeText={setGenus}
      />
      <CustomInput
        label="Familia"
        placeholder="Ej: Rosaceae"
        value={family}
        onChangeText={setFamily}
      />
      <CustomInput
        label="Nombres comunes (separados por coma)"
        placeholder="Ej: rosa, rosa silvestre, rosa mosqueta"
        value={commonNamesText}
        onChangeText={setCommonNamesText}
      />

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        <Text style={styles.imagePickerText}>Seleccionar Imagen (opcional)</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 120, borderRadius: 8, marginVertical: 10 }}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        style={[styles.button, styles.submitButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Crear Planta'}</Text>
      </TouchableOpacity>

      {postError && <Text style={styles.errorText}>Error: {JSON.stringify(postError)}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModalAndGoBack}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Planta creada con éxito</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeModalAndGoBack}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePickerButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  imagePickerText: {
    color: '#333',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginVertical: 6,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    marginHorizontal: 30,
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 20,
    marginBottom: 15,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreatePlant;
