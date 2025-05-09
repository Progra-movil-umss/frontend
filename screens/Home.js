import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';

const TITLE_COLOR = '#4CAF50';

const Home = () => {
  
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      console.log("Access Token en Home:", accessToken);
    }
  }, [accessToken]);  // Se ejecuta cada vez que accessToken cambia
  
  return (
    <View style={styles.container}>
      <Text style={styles.titleBlack}>Bienvenido a </Text>
      <Text style={styles.titleGreen}>FloraFind</Text>
      {accessToken && <Text>Token: {accessToken}</Text>}
      <Navbar accessToken={accessToken} />
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
    color: '#4CAF50',
    textAlign: 'center',
  },
  titleBlack: {
    color: 'black',
    fontSize: 30,
    marginRight: 145,
    top: 1,
  },
  titleGreen: {
    color: TITLE_COLOR,
    fontWeight: 'bold',
    fontSize: 30,
    marginLeft: 200,
    top: -43,
  },

});
export default Home;
