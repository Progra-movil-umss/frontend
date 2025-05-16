import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Image } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useFetch } from '../hooks/useFetch';
import CardGarden from '../components/CardGarden';

const TITLE_COLOR = '#4CAF50';

const Home = () => {
  const { accessToken } = useAuth();

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
});

export default Home;
