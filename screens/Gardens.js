import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CardGarden from '../components/CardGarden';
import Svg, { Path } from 'react-native-svg';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../AuthContext';

const EmptyStateIcon = () => (
  <Svg
    width={64}
    height={64}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#939393"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M17 17v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4h8" />
    <Path d="M11.9 7.908a6 6 0 0 0-4.79-4.806" />
    <Path d="M3 3v2a6 6 0 0 0 6 6h2" />
    <Path d="M13.531 8.528A6 6 0 0 1 18 5h3v1a6 6 0 0 1-5.037 5.923" />
    <Path d="M12 15v-3" />
    <Path d="M3 3l18 18" />
  </Svg>
); 

const Gardens = ({ route, navigation }) => {
  const { accessToken } = useAuth(); 

  const {
    data,
    loading,
    error,
    // cancelRequest, // Puedes usarlo si quieres agregar botón cancelar petición
  } = useFetch('https://florafind-aau6a.ondigitalocean.app/gardens', accessToken);

  const gardens = data?.items || [];

  React.useEffect(() => {
    if (!accessToken) {
      Alert.alert('Error', 'No se ha encontrado el token de acceso');
    }
  }, [accessToken]);

  const handleCreateGarden = () => navigation.navigate('CreateGarden');

  const handleGardenPress = (garden) => {
    Alert.alert('Jardín seleccionado', garden.name);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.loadingText}>Cargando jardines...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.errorText}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Jardines</Text>

      {gardens.length === 0 ? (
        <View style={styles.emptyState}>
          <EmptyStateIcon />
          <Text style={styles.emptyText}>
            Aún no tienes jardines añadidos crea uno para empezar
          </Text>
          <CardGarden gardens={[]} onCreatePress={handleCreateGarden} />
        </View>
      ) : (
        <CardGarden
          gardens={gardens}
          onCreatePress={handleCreateGarden}
          onGardenPress={handleGardenPress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', paddingTop: 40, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4, textAlign:"center" },
  subTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12, color: '#333' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#939393', textAlign: 'center' },
  loadingText: { fontSize: 16, color: '#4CAF50', textAlign: 'center' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
});

export default Gardens;
