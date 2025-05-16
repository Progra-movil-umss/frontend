import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useFetch } from '../hooks/useFetch';
import CardGarden from '../components/CardGarden';
import { useNavigation } from '@react-navigation/native';

const TITLE_COLOR = '#4CAF50';

const Home = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();

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
      <Text style={styles.titleBlack}>Bienvenido a </Text>
      <Text style={styles.titleGreen}>FloraFind</Text>
      {accessToken && <Text>Token: {accessToken}</Text>}

      <TouchableOpacity
        style={styles.alarmButton}
        onPress={() => navigation.navigate('Alarms')}
      >
        <Ionicons name="alarm-outline" size={28} color="#4CAF50" style={{ marginRight: 10 }} />
        <Text style={styles.alarmButtonText}>Crear alarmas</Text>
      </TouchableOpacity>
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
  alarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f6e9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  alarmButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Home;
