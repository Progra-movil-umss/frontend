import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../core/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../core/api';
import WeatherWidget from '../components/WeatherWidget';

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

    <ScrollView style={[styles.container, isDark && { backgroundColor: '#111' }]}>
      <View style={[styles.content, { paddingHorizontal: 24 }, { paddingTop: 50 }]}>
        <Text style={[styles.titleBlack, isDark && { color: '#fff' }]}>Bienvenido a </Text>
        <Text style={[styles.titleGreen, isDark && { color: '#aed581' }]}>FloraFind</Text>
        <Text style={[styles.subtitle, isDark && { color: '#bbb' }]}>Gestiona tus jardines, plantas y recordatorios de riego fácilmente.</Text>
        
        {/* Widget del clima */}
        <WeatherWidget />

        <TouchableOpacity
          style={styles.alarmButton}
          onPress={() => navigation.navigate('Alarms')}
        >
          <Ionicons name="alarm-outline" size={28} color="#4CAF50" style={{ marginRight: 10 }} />
          <Text style={styles.alarmButtonText}>Crear alarmas</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  alarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f6e9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  alarmButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
  },

});

export default Home;
