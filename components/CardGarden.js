import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const defaultImage = require('../assets/defaultGarden1.png');

const CardGarden = ({ gardens, onCreatePress, onGardenPress, onOptionsPress  }) => {
  const renderGarden = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onGardenPress(item)}
      activeOpacity={0.8}
    >
      {item.image_url ? (
        <Image 
            source={item.image_url ? { uri: item.image_url } : defaultImage} 
            style={styles.image} 
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Image 
            source={defaultImage}
            style={styles.image}
          />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation(); // Evitar que active el onPress principal del card
          onOptionsPress && onOptionsPress(item);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Área más cómoda para tocar
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#4CAF50" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={gardens}
        keyExtractor={(item) => item.id?.toString() || item.name}
        renderItem={renderGarden}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={onCreatePress}
        activeOpacity={0.8}
      >
        <Ionicons
          name="add"
          size={18}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.createButtonText}>Crear Nuevo Jardin</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#999',
    fontSize: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#444',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CardGarden;
