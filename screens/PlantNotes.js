import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../core/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const PlantNotes = ({ route, navigation }) => {
  const { plantId, plantName } = route.params;
  const { accessToken } = useAuth();

  const url = `https://florafind-aau6a.ondigitalocean.app/plants/${plantId}/notes`;
  const { data, loading, error } = useFetch(url, accessToken);

  useEffect(() => {
    console.log('[PlantNotes] ID:', plantId);
  }, [plantId]);

  const renderItem = ({ item }) => (
    <View style={styles.noteCard}>
    <Text style={styles.noteText}>{item.text}</Text>
    <Text style={styles.noteDate}>
        {new Date(item.observation_date).toLocaleString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
    })}
</Text>

    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notas de {plantName}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.errorText}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Text>
      ) : data?.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            Aún no tienes notas creadas para esta planta
          </Text>
        </View>
      )}

      {/* Botón inferior izquierdo (aún sin funcionalidad) */}
        <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => navigation.navigate('CreateNotes', { plantId, plantName })}
            >
            <Ionicons name="add" size={28} color="#000" />
        </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 16,
  },
  noteCard: {
    backgroundColor: '#F2F5A9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: '#F2F5A9',
    padding: 16,
    borderRadius: 32,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
});

export default PlantNotes;
