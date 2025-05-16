import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CustomInput from '../components/CustomInput';
import { useFetchPost } from '../hooks/useFetchPost'; // Tu hook genérico POST

const CreateGarden = ({ route, navigation }) => {
  const { accessToken } = route.params || {};
  const { data, loading, error, post } = useFetchPost(accessToken);

  const [gardenName, setGardenName] = useState('');
  const [gardenDescription, setGardenDescription] = useState('');
  const [image, setImage] = useState(null); // Aquí guardaremos la URI de la imagen
  const [modalVisible, setModalVisible] = useState(false);

  // Función para solicitar permisos y seleccionar imagen
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso necesario', 'Se requiere permiso para acceder a la galería de imágenes');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateGarden = async () => {
    if (!gardenName.trim()) {
      Alert.alert('Error', 'El nombre del jardín es obligatorio');
      return;
    }

    // Crear FormData para multipart/form-data
    const formData = new FormData();
    formData.append('name', gardenName);
    formData.append('description', gardenDescription || '');

    if (image) {
      // Extraer extensión para el tipo MIME (png, jpg, jpeg...)
      const fileType = image.split('.').pop();
      formData.append('image', {
        uri: image,
        name: `garden_image.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      await post('https://florafind-aau6a.ondigitalocean.app/gardens', formData, true);
      setModalVisible(true);
    } catch (err) {
      console.error('Error creando jardín:', err);
      Alert.alert('Error', 'Hubo un problema al crear el jardín');
    }
  };

  const closeModalAndNavigate = () => {
    setModalVisible(false);
    navigation.navigate('Gardens');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Jardín</Text>

      <CustomInput
        label="Nombre del Jardín"
        placeholder="Ingrese el nombre del jardín"
        value={gardenName}
        onChangeText={setGardenName}
      />
      <CustomInput
        label="Descripción"
        placeholder="Ingrese una descripción"
        value={gardenDescription}
        onChangeText={setGardenDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        <Text style={styles.imagePickerText}>Seleccionar Imagen (opcional)</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 120, borderRadius: 8, marginVertical: 10 }}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={handleCreateGarden}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Crear Jardín'}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>Error: {JSON.stringify(error)}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModalAndNavigate}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Jardín creado con éxito</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModalAndNavigate}>
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 40,
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
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 12,
    color: 'red',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateGarden;
