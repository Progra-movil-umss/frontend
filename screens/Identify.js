import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, useColorScheme, StyleSheet } from 'react-native';
import CameraScreen from '../Camera/CameraScreen';
import { useAuth } from '../core/AuthContext';


const Identify = () => {
  
  const navigation = useNavigation();
  const { accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }]}> 
      <CameraScreen onClose={() => navigation.navigate('Inicio')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


export default Identify;
