import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TITLE_COLOR = '#4CAF50';

const Home = ({ route }) => {
  const { accessToken } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenido, tu token es:</Text>
      <Text style={[styles.welcome, { fontSize: 14 }]} numberOfLines={1}>
        {accessToken}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TITLE_COLOR,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default Home;
