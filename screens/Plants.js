import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../AuthContext';
import CardPlants from '../components/CardPlants';
import { Ionicons } from '@expo/vector-icons';

const Plants = ({ route, navigation }) => {
  const { gardenId, gardenName } = route.params;
  const { accessToken } = useAuth();

  const url = `https://florafind-aau6a.ondigitalocean.app/gardens/${gardenId}/plants?limit=50&skip=0`;
  const { data, loading, error } = useFetch(url, accessToken);

  const plants = data?.items || [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Text>
      </View>
    );
  }

  const handleIdentifyPress = () => {
    if (!accessToken) {
      // Si no hay token, muestra alerta y evita navegar
      alert('No autorizado. Por favor, inicia sesión.');
      return;
    }
    navigation.navigate('Identificar', { accessToken }); // Envía el token si la pantalla lo necesita
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plantas de {gardenName}</Text>
      <ScrollView
        contentContainerStyle={styles.plantsContainer}
        showsVerticalScrollIndicator={false}
      >
        {plants.length === 0 ? (
          <Text style={styles.noPlantsText}>No hay plantas en este jardín.</Text>
        ) : (
          plants.map((plant) => {
            const imageUri = plant.image_url && plant.image_url !== "null" ? plant.image_url : null;
            const plantName = plant.alias || "Sin nombre";  // Asegurarse de que siempre haya un valor
            const scientificName = plant.scientific_name_without_author || "Nombre científico desconocido"; // Valor predeterminado

            return (
              <CardPlants
                key={plant.id}
                imageUri={imageUri}
                name={plantName}
                scientificName={scientificName}
              />
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleIdentifyPress}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 8, backgroundColor: '#f9f9f9' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#4CAF50', marginBottom: 20, textAlign: 'center', paddingHorizontal: 8, },
  plantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingBottom: 20,
  },
  noPlantsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default Plants;
