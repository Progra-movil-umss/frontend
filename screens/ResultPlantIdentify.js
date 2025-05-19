import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, useColorScheme } from 'react-native';
import { useRoute } from '@react-navigation/native';

const TITLE_COLOR = '#4CAF50';

export default function ResultPlantIdentify() {
  const route = useRoute();
  const result = route.params?.result;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  console.log('species', result.species);

  if (!result || !Array.isArray(result.results) || result.results.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No se encontraron resultados.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.scrollViewContent, isDark && { backgroundColor: '#111' }]}>
      <View style={[styles.container, isDark && { backgroundColor: '#111' }]}>
        <Text style={styles.title}>Resultados de la Identificación:</Text>

        {result.results.length > 0 && (
          <View style={styles.bestMatchContainer}>
            <Text style={styles.bestMatchTitle}>Mejor Coincidencia:</Text>
            <Text style={styles.bestMatchName}>
              {result.bestMatch || result.results[0].species?.scientificName || 'Desconocida'}
            </Text>

            <View style={styles.bestMatchScoreContainer}>
              <Text style={styles.scoreText}>
                Coincidencia: {Math.round((result.results[0].score ?? 0) * 100)}%
              </Text>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round((result.results[0].score ?? 0) * 100)}%` },
                  ]}
                />
              </View>
            </View>

            {(() => {
              const imageObj = result.results[0].images?.[0];
              const imageUrl =
                typeof imageObj?.url?.m === 'string'
                  ? imageObj.url.m
                  : typeof imageObj?.url?.o === 'string'
                  ? imageObj.url.o
                  : null;
              return imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.bestMatchImage} resizeMode="cover" />
              ) : (
                <Text style={styles.noImage}>No hay imagen disponible</Text>
              );
            })()}
          </View>
        )}

        
        <Text style={styles.matchingPlantsText}>Plantas coincidentes:</Text>

        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {result.results.map((item, index) => {
            const imageObj = item.images?.[0];
            const imageUrl =
              typeof imageObj?.url?.m === 'string'
                ? imageObj.url.m
                : typeof imageObj?.url?.o === 'string'
                ? imageObj.url.o
                : null;

            const score = item.score ?? 0;
            const scorePercent = Math.round(score * 100);

            return (
              <View key={index} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text
                    style={styles.species}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    Especie: {item.species?.scientificName || 'Desconocida'}
                  </Text>

                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>Coincidencia: {scorePercent}%</Text>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarFill, { width: `${scorePercent}%` }]} />
                    </View>
                  </View>

                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.noImage}>No hay imagen disponible</Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 32,
  },
  container: {
    padding: 16,
  },
  scrollContainer: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    color: TITLE_COLOR,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // Estilos para mejor coincidencia
  bestMatchContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(29, 179, 37, 0.15)',
    borderRadius: 8,
    alignItems: 'center',
  },
  bestMatchTitle: {
    fontSize: 20,
    color: TITLE_COLOR,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bestMatchName: {
    fontSize: 18,
    color: TITLE_COLOR,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  bestMatchScoreContainer: {
    width: '100%',
    marginBottom: 10,
  },
  bestMatchImage: {
    width: 250,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },

  
  matchingPlantsText: {
    fontSize: 18,
    color: TITLE_COLOR,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },

  card: {
    width: 280,
    height: 300,
    marginRight: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    flexShrink: 0,
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  species: {
    fontSize: 16,
    color: TITLE_COLOR,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 10,
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  image: {
    width: 250,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  noImage: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
