import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Image } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useFetch } from '../hooks/useFetch';

const TITLE_COLOR = '#4CAF50';

const Home = () => {
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      console.log("Access Token en Home:", accessToken);
    }
  }, [accessToken]);

  const { data, loading, error, cancelRequest } = useFetch(
    'https://florafind-aau6a.ondigitalocean.app/gardens',
    accessToken
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a FloraFind</Text>

      {loading && <ActivityIndicator size="large" color={TITLE_COLOR} />}
      
      {error && (
        <Text style={styles.error}>Error: {typeof error === 'string' ? error : JSON.stringify(error)}</Text>
      )}

      {data && data.items && data.items.length > 0 ? (
        <View style={styles.dataContainer}>
          <Text style={styles.infoText}>Nombre: {data.items[0].name}</Text>
          <Text style={styles.infoText}>Descripción: {data.items[0].description}</Text>
          <Image 
            source={{ uri: data.items[0].image_url }}
            style={{ width: 200, height: 120, borderRadius: 8 }}
            resizeMode="cover"
          />

          {/* Aquí puedes añadir más campos o iterar para mostrar todos */}
        </View>
      ) : (
        !loading && <Text>No se encontraron jardines.</Text>
      )}

      <Button title="Cancelar petición" onPress={cancelRequest} color="#f44336" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: TITLE_COLOR,
    textAlign: 'center',
  },
  error: {
    marginTop: 12,
    color: 'red',
    textAlign: 'center',
  },
  dataContainer: {
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default Home;
