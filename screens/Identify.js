import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, useColorScheme, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CameraScreen from '../Camera/CameraScreen';
import { useAuth } from '../core/AuthContext';


const Identify = () => {
  
  const navigation = useNavigation();
  const { accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.container, isDark && { backgroundColor: '#111' }]}> 
        <CameraScreen onClose={() => navigation.navigate('Inicio')} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    padding: 16,
  },
});


export default Identify;
