import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import GalleryScreen from './GaleryScreen';

export default function CameraScreen({onClose}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [photos, setPhotos] = useState([]);
  const cameraRef = useRef(null);
  const [lastPhoto, setLastPhoto] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
// Permisos de Camara
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara para usar esta función.');
      }
    })();
  }, []);

  const takePhoto = async () => {
    if (photos.length >= 5) {
      alert('Ya alcanzaste el límite de 5 fotos para identificar tu planta. \nElimina alguna foto para añadir uno nuevo');
      return;
    }

    if (isTakingPhoto) return;
    setIsTakingPhoto(true);

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        setLastPhoto(photo.uri);
        setPhotos((prev) => [photo.uri, ...prev]);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const handleDeletePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    if (index === 0) {
      setLastPhoto(newPhotos[0] || null);
    }
  };

  const handleSendPhotos = async () => {
    if (photos.length === 0) {
      alert('No hay fotos para identificar');
      return;
    }
    const formData = new FormData();
  photos.forEach((uri, index) => {
    formData.append('images', {
      uri: uri,
      name: `image_${index}.jpg`,
      type: 'image/jpeg',
    });
  });

  try {
    const response = await fetch('https://florafind-aau6a.ondigitalocean.app/Identify', {
      method: "POST",
      headers: {
        "Authorization": "Bearer TU_TOKEN_AQUI",
        "Content-Type": "multipart/form-data"
      },
      body: formData
    });

    const result = await response.json();
    console.log("Resultado de la identificación:", result);
    alert(`Planta identificada: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error("Error al enviar las imágenes:", error);
    alert("Error al identificar la planta. Intenta de nuevo.");
  }
  };

  return (
    <View style={styles.container}>
      {showGallery ? (
        <GalleryScreen photos={photos} onClose={() => setShowGallery(false)} onDelete={handleDeletePhoto} />
      ) : (
        <>
          <CameraView style={styles.camera} facing={facing} flash={flash} ref={cameraRef}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={toggleFlash}>
                <Image
                  source={flash === 'on' ? require('../assets/flash.png') : require('../assets/flash_off.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
              <Image source={require('../assets/close.png')} style={styles.icon} />
              </TouchableOpacity>
            </View>
          </CameraView>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={takePhoto}
              disabled={isTakingPhoto}
              style={[styles.shutterButton, isTakingPhoto && { opacity: 0.5 }]}
            >
              <Image source={require('../assets/shutter.png')} style={styles.shutterIcon} />
            </TouchableOpacity>
          </View>

          {lastPhoto && (
            <TouchableOpacity
              style={styles.thumbnailContainer}
              onPress={() => setShowGallery(true)}
            >
              <Image source={{ uri: lastPhoto }} style={styles.thumbnail} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendPhotos}
          >
            <Text style={styles.sendButtonText}>Identificar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterIcon: {
    width: 40,
    height: 40,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sendButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 2,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
