import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { AuthContext } from '../core/AuthContext';

const Profile = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    // No navigation.reset aquí, el flujo de AuthContext y App.js se encarga
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }]}>
      <Text style={[styles.title, isDark && { color: '#aed581' }]}>Perfil</Text>
      {/* ...otros datos de perfil si los hay... */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32 },
  logoutButton: { backgroundColor: '#E53935', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10, marginTop: 24 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default Profile;
