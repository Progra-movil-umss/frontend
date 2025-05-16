import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import GalleryScreen from './GaleryScreen';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../AuthContext';


export default function CameraScreen({onClose}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [photos, setPhotos] = useState([]);
  const cameraRef = useRef(null);
  const [lastPhoto, setLastPhoto] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { accessToken } = useAuth();

  console.log("Access Token en Camara:", accessToken);
// Permisos de Camara
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara para usar esta función.', [
          {
            text: 'OK',
            onPress: async () => {
              await requestPermission();
            },
          },
        ]);
      } else {
        await requestPermission();
      }
    })();
  }, []);
//Renderizado de camara
  useFocusEffect(
    React.useCallback(() => {
      setIsCameraReady(true); 
      return () => {
        setIsCameraReady(false); 
      };
    }, [])
  );
  
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
    const response = await fetch('https://florafind-aau6a.ondigitalocean.app/plants/identify', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data"
      },
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      console.log("JSON ",result);
      const {
        bestMatch,
        language,
        predictedOrgans,
        preferedReferential,
        query,
        remainingIdentificationRequests,
        results,
        version
      } = result;
    
      let message = `IDENTIFICACIÓN DE PLANTA\n\n`;
    
      message += `Planta mejor coincidiente: ${bestMatch}\n`;
      message += `Idioma: ${language}\n`;
      message += `Referencial preferido: ${preferedReferential}\n`;
      message += `Versión del motor: ${version}\n\n`;
    
      message += `ÓRGANOS PREDICHOS:\n`;
      predictedOrgans.forEach((organ, index) => {
        message += `    Órgano: ${organ.organ}\n`;
        message += `    Confianza: ${(organ.score * 100).toFixed(2)}%\n\n`;
      });
    
      message += `RESULTADOS SUGERIDOS:\n`;
      results.forEach((res, index) => {
        const speciesName = res.species?.name || 'No disponible';
        message += `  Resultado #${index + 1}:\n`;
        message += `    Especie: ${speciesName}\n`;
        message += `    Confianza: ${(res.score * 100).toFixed(2)}%\n\n`;
      });
    
      message += `Identificaciones disponibles restantes: ${remainingIdentificationRequests}\n`;
    
      alert(message);
    } else {
      console.error("Error en respuesta del servidor:", result);
      alert(`Error del servidor: ${result.message || 'Intenta nuevamente.'}`);
    }
    }catch (error) {
      console.error("Error al enviar las imágenes:", error);
      alert("Ocurrió un error al identificar la planta. Verifica tu conexión e intenta de nuevo.");
    }
  
  };

  return (
    <View style={styles.container}>
      {showGallery ? (
        <GalleryScreen photos={photos} onClose={() => setShowGallery(false)} onDelete={handleDeletePhoto} />
      ) : (
        <>
          {!permission?.granted && (
            <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000'}}>
              <Text style={{color:'#fff', fontSize:18, textAlign:'center', padding:24}}>
                No tienes permisos de cámara habilitados. Ve a la configuración del sistema y otórgalos para usar esta función.
              </Text>
            </View>
          )}
          {permission?.granted && !isCameraReady && (
            <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000'}}>
              <Text style={{color:'#fff', fontSize:18, textAlign:'center', padding:24}}>
                Cargando cámara...
              </Text>
            </View>
          )}
          {permission?.granted && isCameraReady && (
            <View style={{flex:1}}>
              <CameraView style={styles.camera} facing={facing} flash={flash} ref={cameraRef} />
              <View style={styles.topBar} pointerEvents="box-none">
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
              <View style={styles.bottomBar} pointerEvents="box-none">
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
            </View>
          )}
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
