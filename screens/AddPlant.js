import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import { useAuth } from '../core/AuthContext';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const AddPlant = ({ navigation }) => {
  const { accessToken } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const route = useRoute();
  const [alias, setAlias] = useState('');
  const [scientificNameWithoutAuthor, setScientificNameWithoutAuthor] = useState('');
  const [genus, setGenus] = useState('');
  const [family, setFamily] = useState('');
  const [commonNames, setCommonNames] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const { gardenId } = route.params || {};

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara para usar esta función.');
      } else {
        await requestPermission();
      }
    })();
  }, []);

  console.log("ID del Jardín recibido:", gardenId); 

  const handleIdentifyPlant = async () => {
    try {
      if (!cameraRef.current) {
        alert('Cámara no lista.');
        return;
      }

      
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      setIsLoading(true);
      const formData = new FormData();
      formData.append('images', {
        uri: photo.uri,
        name: 'plant_photo.jpg',
        type: 'image/jpeg',
      });
      setIsLoading(true);
      const response = await fetch('https://florafind-aau6a.ondigitalocean.app/plants/identify', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Respuesta JSON:", result);

        const species = result?.results?.[0]?.species || {};

        setAlias(result?.bestMatch ?? 'Nombre desconocido');
        setScientificNameWithoutAuthor(species?.scientificNameWithoutAuthor ?? 'Desconocido');
        setGenus(species?.genus?.scientificNameWithoutAuthor ?? 'Desconocido');
        setFamily(species?.family?.scientificNameWithoutAuthor ?? 'Desconocido');
        setCommonNames(species?.commonNames ?? []);

        // Extraer la primera imagen de la planta
        const firstImageUrl = result?.results?.[0]?.images?.[0]?.url?.m ?? null;

        setImageUrl(firstImageUrl);

        setShowCamera(false);
      } else {
        alert('Error al identificar la planta.');
      }
    } catch (error) {
      console.error('Error al identificar la planta:', error);
      alert('Ocurrió un error al identificar la planta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetakePhoto = () => {
    setShowCamera(true); //Reactivar la cámara al presionar el botón
    setImageUrl(''); //Eliminar la imagen previa
  };
  const handleSubmit = async () => {
  console.log("Ejecutando handleSubmit...");
  
  // Validar si la planta ya existe en el jardín antes de añadirla
  try {
    const checkResponse = await fetch(`https://florafind-aau6a.ondigitalocean.app/gardens/${gardenId}/plants`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (!checkResponse.ok) {
      throw new Error("Error al verificar la existencia de la planta");
    }

    const { items } = await checkResponse.json();
    const existingPlant = items.find((plant) => plant.scientific_name_without_author === scientificNameWithoutAuthor);

    if (existingPlant) {
      Alert.alert("Error", `La planta "${scientificNameWithoutAuthor}" ya está registrada en este jardín. Por favor Ingrese otro Alias `);
      return; // Detiene la ejecución para evitar añadir duplicados
    }
  } catch (error) {
    Alert.alert("Error", "No se pudo verificar si la planta ya existe.");
    return;
  }

  // Si la planta no existe, proceder a añadirla
  const newPlant = {
    alias,
    image_url: imageUrl,
    scientific_name_without_author: scientificNameWithoutAuthor,
    genus,
    family,
    common_names: commonNames,
    garden_id: gardenId,
  };

  try {
    const response = await fetch(`https://florafind-aau6a.ondigitalocean.app/gardens/${gardenId}/plants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(newPlant),
    });

    if (!response.ok) throw new Error("Error al añadir la planta");

    Alert.alert("Éxito", "Planta añadida correctamente.");
    navigation.goBack();
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Identificar y Guardar Planta</Text>

        {/*Mostrar cámara solo si `showCamera` es true */}
        {showCamera ? (
          <View style={styles.cameraContainer}>
            {permission?.granted && (
              <CameraView style={styles.camera} ref={cameraRef} />
            )}
          </View>
        ) : (
          imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
          )
        )}

        {/*Botón para identificar planta (solo visible cuando la cámara está activa) */}
        {showCamera && (
          <TouchableOpacity style={styles.sendButton} onPress={handleIdentifyPlant}>
            <Text style={styles.sendButtonText}>Identificar Planta</Text>
          </TouchableOpacity>
        )}

        {/*Botón pequeño para volver a tomar foto (solo visible cuando la cámara está oculta) */}
        {!showCamera && (
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetakePhoto}>
            <Text style={styles.retakeButtonText}>Volver a tomar foto</Text>
          </TouchableOpacity>
        )}

        {/* Datos de la planta */}
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Alias:</Text>
          <TextInput style={styles.input} value={alias} onChangeText={setAlias} />
        </View>
          <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Nombre Científico:</Text>
          <TextInput style={styles.input} value={scientificNameWithoutAuthor} onChangeText={setScientificNameWithoutAuthor} />
        </View>
          <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Género:</Text>
          <TextInput style={styles.input} value={genus} onChangeText={setGenus} />
        </View>
          <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Familia:</Text>
          <TextInput style={styles.input} value={family} onChangeText={setFamily} />
        </View>
          <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Nombres Comunes:</Text>
          <TextInput style={styles.input} value={commonNames.join(', ')} onChangeText={(text) => setCommonNames(text.split(', '))} />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Guardar Planta</Text>
        </TouchableOpacity>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Identificando planta...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    padding: width * 0.05,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  cameraContainer: {
    height: height * 0.3,
    justifyContent: 'center',
    marginBottom: height * 0.02,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  sendButton: {
    marginBottom: height * 0.01,
    backgroundColor: '#4CAF50',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.06,
    borderRadius: 8,
    alignItems: 'center',
    width: '65%',
    alignSelf: 'center',
  },
  saveButton: {
  backgroundColor: '#4CAF50', 
  paddingVertical: height * 0.012,
  paddingHorizontal: width * 0.06,
  borderRadius: 8,
  alignItems: 'center',
  width: '60%',
  alignSelf: 'center',
},
  retakeButton: {
    backgroundColor: '#81C784',
    marginBottom: height * 0.03,
    paddingVertical: height * 0.008, 
    paddingHorizontal: width * 0.04,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: height * 0.02,
  },
  retakeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  thumbnail: {
    width: width * 0.4,
    height: width * 0.4,
    alignSelf: 'center',
    marginVertical: height * 0.02,
    borderRadius: 10,
  },
  sendButtonText: {
  color: 'white', 
  fontWeight: 'bold',
  textAlign: 'center',
},
saveButtonText: {
  color: 'white', 
  fontWeight: 'bold',
  textAlign: 'center',
},
inputRow: {
  flexDirection: 'row', // 🔹 Alinea los elementos horizontalmente
  alignItems: 'center', // 🔹 Asegura que estén alineados correctamente
  marginBottom: height * 0.01,
},
inputLabel: {
  width: width * 0.3, // 🔹 Ajusta el ancho del título
  fontWeight: 'bold',
  fontSize: width * 0.04,
  color: '#81C784',
},
input: {
  flex: 1, // 🔹 Permite que el campo de entrada ocupe el espacio restante
  borderWidth: 1,
  borderColor: '#ccc',
  padding: height * 0.015,
  borderRadius: 5,
  fontSize: width * 0.045,
},
loadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // 🔹 Oscurece la pantalla
  justifyContent: 'center',
  alignItems: 'center',
},
loadingText: {
  color: 'white',
  fontSize: width * 0.05,
  fontWeight: 'bold',
  marginTop: height * 0.02,
},
});

export default AddPlant;
