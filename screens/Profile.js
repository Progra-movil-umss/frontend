import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.container, isDark && { backgroundColor: '#111' }]}>
        <Text>Pantalla Profile</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    // Puedes agregar padding si lo deseas
  },
};

export default Profile;
