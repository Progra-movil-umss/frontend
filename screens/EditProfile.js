import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  useColorScheme,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import { useAuth } from '../core/AuthContext';
import { useNavigation } from '@react-navigation/native';

const TITLE_COLOR = '#4CAF50';
const DISABLED_COLOR = '#81C784';

const EditProfile = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Estados para inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Estados para validaciones y toques
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    email: false,
    username: false,
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado modales
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [modalWrongPasswordVisible, setModalWrongPasswordVisible] = useState(false);

  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);


  // VALIDACIONES
  useEffect(() => {
    const errs = {};

    // email
    if (!email.trim()) {
      errs.email = 'El correo electrónico es obligatorio';
    } else if (!email.includes('@')) {
      errs.email = 'Ingrese un correo electrónico válido';
    }

    // username
    if (!username.trim()) {
      errs.username = 'El nombre de usuario es obligatorio';
    }

    // current password siempre obligatorio para actualizar
    if (!currentPassword) {
      errs.currentPassword = 'La contraseña actual es obligatoria';
    }

    // Si ponen nueva contraseña, validar tamaño y que coincida confirmación
    if (newPassword) {
      if (newPassword.length < 6) {
        errs.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      }
      if (confirmNewPassword !== newPassword) {
        errs.confirmNewPassword = 'Las contraseñas no coinciden';
      }
    } else {
      // Si no hay nueva contraseña, confirmNewPassword debe estar vacío (opcional)
      if (confirmNewPassword) {
        errs.confirmNewPassword = 'Debe ingresar la nueva contraseña primero';
      }
    }

    setErrors(errs);
    setValid(Object.keys(errs).length === 0);

  }, [email, username, currentPassword, newPassword, confirmNewPassword]);

  // Manejo de submit, abre modal confirmación
  const onPressGuardarCambios = () => {
    console.log('[EditProfile] Botón Guardar Cambios presionado');
    setTouched({
      email: true,
      username: true,
      currentPassword: true,
      newPassword: true,
      confirmNewPassword: true,
    });

    if (!valid) {
      console.log('[EditProfile] Validación fallida, no se abre modal de confirmación', errors);
      Alert.alert('Error', 'Por favor corrige los errores en el formulario.');
      return;
    }

    setModalConfirmVisible(true);
  };

  const closeSuccessModal = () => {
  setModalSuccessVisible(false);
  navigation.navigate('Home', { screen: 'Perfil' });
};


  // Función que envía datos al backend
  const handleGuardarConfirmado = async () => {
    setModalConfirmVisible(false);
    setLoading(true);

    const body = {
      email: email.trim(),
      username: username.trim(),
      current_password: currentPassword,
    };
    // Solo mandar new_password si está presente (backend no lo requiere si no cambia)
    if (newPassword) {
      body.new_password = newPassword;
    }

    console.log('[EditProfile] Enviando PUT /auth/me con body:', body);

    try {
      const response = await fetch('https://florafind-aau6a.ondigitalocean.app/auth/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      const respText = await response.text();
      let respJson = null;
      try {
        respJson = JSON.parse(respText);
      } catch {}

      console.log('[EditProfile] Respuesta backend:', response.status, respJson || respText);

      if (response.ok) {
        setModalSuccessVisible(true);
      } else {
        // Manejo error 400 con mensaje de contraseña incorrecta
        if (response.status === 400 && respJson?.detail?.includes('401: Credenciales inválidas')) {
          console.warn('[EditProfile] Contraseña actual incorrecta detectada');
          setModalWrongPasswordVisible(true);
        } else {
          const errorMsg = respJson?.detail || 'Error al actualizar perfil';
          console.error('[EditProfile] Error desconocido:', errorMsg);
          Alert.alert('Error', errorMsg);
        }
      }
    } catch (error) {
      console.error('[EditProfile] Error en fetch:', error);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  // Cierre modal contraseña incorrecta
  const closeWrongPasswordModal = () => {
    setModalWrongPasswordVisible(false);
    setCurrentPassword('');
    setTouched((t) => ({ ...t, currentPassword: false }));
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }, { paddingHorizontal: 24 }]}>
      <Text style={[styles.title, isDark && { color: TITLE_COLOR }]}>Editar perfil</Text>

      <CustomInput
        label="Correo electrónico"
        placeholder="Ingrese su correo electrónico"
        value={email}
        onChangeText={text => {
          setEmail(text);
          if (!touched.email) setTouched({ ...touched, email: true });
        }}
        keyboardType="email-address"
        error={touched.email ? errors.email : ''}
      />

      <CustomInput
        label="Nombre de usuario"
        placeholder="Ingrese su nombre de usuario"
        value={username}
        onChangeText={text => {
          setUsername(text);
          if (!touched.username) setTouched({ ...touched, username: true });
        }}
        error={touched.username ? errors.username : ''}
      />

      <CustomInput
        label="Contraseña actual"
        placeholder="Ingrese su contraseña actual"
        value={currentPassword}
        onChangeText={text => {
          setCurrentPassword(text);
          if (!touched.currentPassword) setTouched({ ...touched, currentPassword: true });
        }}
        secureText
        error={touched.currentPassword ? errors.currentPassword : ''}
      />

      <CustomInput
        label="Contraseña nueva"
        placeholder="Ingrese su nueva contraseña"
        value={newPassword}
        onChangeText={text => {
          setNewPassword(text);
          if (!touched.newPassword) setTouched({ ...touched, newPassword: true });
        }}
        secureText
        error={touched.newPassword ? errors.newPassword : ''}
      />

      <CustomInput
        label="Repita la nueva contraseña"
        placeholder="Repita su nueva contraseña"
        value={confirmNewPassword}
        onChangeText={text => {
          setConfirmNewPassword(text);
          if (!touched.confirmNewPassword) setTouched({ ...touched, confirmNewPassword: true });
        }}
        secureText
        error={touched.confirmNewPassword ? errors.confirmNewPassword : ''}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
            style={[
            styles.button,
            { backgroundColor: valid ? TITLE_COLOR : DISABLED_COLOR, opacity: loading ? 0.7 : 1 },
            isDark && { backgroundColor: valid ? '#33691e' : '#607d8b' },
            ]}
            onPress={onPressGuardarCambios}
            disabled={!valid || loading}
        >
            <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[
            styles.button,
            styles.cancelButton,
            { marginTop: 12 },
            ]}
            onPress={() => navigation.navigate('Home', { screen: 'Perfil' })}
            disabled={loading}
        >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
        </TouchableOpacity>
    </View>


      {/* Modal Confirmación edición */}
      <Modal
        visible={modalConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirmar cambios</Text>
            <Text style={styles.confirmMessage}>¿Está seguro de editar la información del perfil?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButtonModal]}
                onPress={() => setModalConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonTextModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButtonModal]}
                onPress={handleGuardarConfirmado}
              >
                <Text style={styles.saveButtonTextModal}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
            {/* Modal éxito */}
        <Modal
        visible={modalSuccessVisible}
        transparent
        animationType="fade"
        onRequestClose={closeSuccessModal}
        >
        <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Éxito</Text>
            <Text style={styles.confirmMessage}>Cambios guardados con éxito</Text>
            <TouchableOpacity
                style={[styles.button, styles.saveButtonModal, { marginTop: 10, width: '60%' }]}
                onPress={closeSuccessModal}
            >
                <Text style={styles.saveButtonTextModal}>Aceptar</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
      {/* Modal Contraseña actual incorrecta */}
      <Modal
        visible={modalWrongPasswordVisible}
        transparent
        animationType="fade"
        onRequestClose={closeWrongPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Error</Text>
            <Text style={styles.confirmMessage}>Contraseña actual incorrecta</Text>
            <TouchableOpacity
              style={[styles.button, styles.saveButtonModal, { marginTop: 10, width: '60%' }]}
              onPress={closeWrongPasswordModal}
            >
              <Text style={styles.saveButtonTextModal}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TITLE_COLOR,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: { marginTop: 16, paddingHorizontal: 24 },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  cancelButtonModal: {
    backgroundColor: '#ccc',
    flex: 1,
    marginRight: 10,
    borderRadius: 8,
    paddingVertical: 14,
  },
  cancelButtonTextModal: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  saveButtonModal: {
    backgroundColor: '#4CAF50',
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonTextModal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
    cancelButton: {
    backgroundColor: '#ccc',
    },
    cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    },
});

export default EditProfile;
