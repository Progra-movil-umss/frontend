import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import CustomInput from '../components/CustomInput';

const CreateGarden = ({ route, navigation }) => {
  const { accessToken } = route.params || {}; // Recuperar el token de acceso

  const [gardenName, setGardenName] = useState('');
  const [gardenDescription, setGardenDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);  // Para el modal de éxito

  // Lógica para seleccionar una imagen (si es necesario)
  const [image, setImage] = useState(null);
  
  const handleCreateGarden = async () => {
    if (!gardenName) {
      Alert.alert('Error', 'El nombre del jardín es obligatorio');
      return;
    }

    // Crear el FormData para enviar como multipart/form-data
    const formData = new FormData();
    formData.append('name', gardenName);
    formData.append('description', gardenDescription || '');

    // Si tienes una imagen (opcional)
    if (image) {
      const imageUri = image.uri;
      const fileType = imageUri.split('.').pop();
      formData.append('image', {
        uri: imageUri,
        type: `image/${fileType}`,
        name: `garden_image.${fileType}`,
      });
    }

    try {
      const response = await fetch('https://florafind-aau6a.ondigitalocean.app/gardens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar el modal de éxito
        setModalVisible(true);
      } else {
        throw new Error('Error al crear el jardín');
      }
    } catch (error) {
      console.error('Error al crear el jardín:', error);
      Alert.alert('Error', 'Hubo un problema al crear el jardín');
    }
  };

  // Función para cerrar el modal y redirigir
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

      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={handleCreateGarden}
      >
        <Text style={styles.buttonText}>Crear Jardín</Text>
      </TouchableOpacity>

      {/* Modal de éxito */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModalAndNavigate}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Jardín creado con éxito</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeModalAndNavigate}
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
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: {
    fontSize: 28,  // Título más grande
    fontWeight: 'bold',
    color: '#4CAF50',  // Color principal
    marginBottom: 40,  // Más arriba
    textAlign: 'center',
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4CAF50',
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  createButton: {
    backgroundColor: '#4CAF50',  // Botón verde
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',  // Texto centrado en el botón
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
