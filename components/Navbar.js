import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="home-outline" size={30} color="#4CAF50" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Identificar')}
      >
        <Ionicons name="search-outline" size={30} color="#4CAF50" />
        <Text style={styles.navText}>Identificar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Gardens')} // Ruta al componente de Jardines
      >
        <Ionicons name="flower-outline" size={30} color="#4CAF50" />
        <Text style={styles.navText}>Jardin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Perfil')}
      >
        <Ionicons name="person-outline" size={30} color="#4CAF50" />
        <Text style={styles.navText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#4CAF50',
  },
});

export default Navbar;
