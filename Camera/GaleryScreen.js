import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GaleryScreen = ({ photos, onClose, onDelete }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity onPress={() => onDelete(index)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 20, paddingHorizontal: 16, backgroundColor: '#000',},
  scrollView: {flexDirection: 'row',flexWrap: 'wrap',justifyContent: 'space-between',},
  photoContainer: {width: '48%',marginBottom: 16,position: 'relative',},
  photo: {width: '100%',height: 200,borderRadius: 8,resizeMode: 'cover',},
  deleteButton: {position: 'absolute',top: 10,right: 10,backgroundColor: '#4CAF50',padding: 8,borderRadius: 5,},
  deleteText: {color: '#fff',fontWeight: 'bold',},
  closeButton: {position: 'absolute',bottom: 20,alignSelf: 'center', backgroundColor: '#4CAF50',padding: 12,borderRadius: 8,},
  closeText: {color: '#fff',fontWeight: 'bold',},
});

export default GaleryScreen;
