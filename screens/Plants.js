import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../AuthContext';
import CardPlants from '../components/CardPlants';

const Plants = ({ route }) => {
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  plantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
});

export default Plants;
