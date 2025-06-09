import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import { useAuth } from '../core/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../core/api';

const TITLE_COLOR = '#4CAF50';

const Home = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (accessToken) {
      console.log("Access Token en Home:", accessToken);
    }
  }, [accessToken]);

  const { data, loading, error, cancelRequest } = useFetch(
    '/gardens',
    accessToken
  );

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }, { paddingHorizontal: 24 }, { paddingTop: 50 }]}>
      <Text style={[styles.titleBlack, isDark && { color: '#fff' }]}>Bienvenido a </Text>
      <Text style={[styles.titleGreen, isDark && { color: '#aed581' }]}>FloraFind</Text>
      <Text style={[styles.subtitle, isDark && { color: '#bbb' }]}>Gestiona tus jardines, plantas y recordatorios de riego fácilmente.</Text>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleBlack: {
    fontSize: 30,
    fontWeight: 'bold',
    color: TITLE_COLOR,
    textAlign: 'center',
  },
  titleGreen: {
    fontSize: 30,
    fontWeight: 'bold',
    color: TITLE_COLOR,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#444',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  
});

export default Home;
