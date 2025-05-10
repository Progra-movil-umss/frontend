import React from 'react';
import { useNavigation } from '@react-navigation/native';
import CameraScreen from '../Camera/CameraScreen';
import { useAuth } from '../AuthContext';


const Identify = () => {
  
  const navigation = useNavigation();
  const { accessToken } = useAuth();
  

  return (
    <CameraScreen onClose={() => navigation.navigate('Inicio')} />
  );
};


export default Identify;
