import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator
} from 'react-native';
import CustomInput from '../components/CustomInput';
import Checkbox from '../components/Checkbox';
import { useNavigation } from '@react-navigation/native';

const TITLE_COLOR = '#4CAF50';
const DISABLED_COLOR = '#81C784';

const Login = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const errs = {};
    if (!username.trim()) errs.username = 'El usuario es obligatorio';
    if (!password)         errs.password = 'La contraseña es obligatoria';
    setErrors(errs);
    setValid(Object.keys(errs).length === 0);
  }, [username, password]);

  const handleLogin = async () => {
    setTouched({ username: true, password: true });
    if (!valid) return;

    setLoading(true);
    setModalMessage('');
    try {
      const resp = await fetch(
        'https://florafind-aau6a.ondigitalocean.app/auth/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username_or_email: username,
            password,
          }),
        }
      );

      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }

      if (!resp.ok) {
        const detail = Array.isArray(data?.detail)
          ? data.detail.map(d => d.msg || JSON.stringify(d)).join('\n')
          : text || 'Error desconocido';
        setModalMessage(detail);
        setModalVisible(true);
      } else {
        // Navega a Home pasando el token
        navigation.replace('Home', { accessToken: data.access_token });
      }
    } catch (e) {
      setModalMessage('Error de red, inténtalo más tarde.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Inicio de Sesión</Text>

      <CustomInput
        label="Usuario"
        placeholder="Ingrese su usuario"
        value={username}
        onChangeText={text => {
          setUsername(text);
          if (!touched.username) setTouched(t => ({ ...t, username: true }));
        }}
        error={touched.username ? errors.username : ''}
      />

      <CustomInput
        label="Contraseña"
        placeholder="Ingrese su contraseña"
        value={password}
        onChangeText={text => {
          setPassword(text);
          if (!touched.password) setTouched(t => ({ ...t, password: true }));
        }}
        secureText
        error={touched.password ? errors.password : ''}
      />

      <View style={styles.row}>
        <Checkbox checked={remember} onToggle={() => setRemember(r => !r)} />
        <Text style={styles.rememberText}>Recordar contraseña</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: valid ? TITLE_COLOR : DISABLED_COLOR,
            opacity: loading ? 0.6 : 1,
          },
        ]}
        onPress={handleLogin}
        disabled={!valid || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: TITLE_COLOR }]}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1, padding: 16, justifyContent: 'center' },
  title:          { fontSize: 32, fontWeight: 'bold', color: TITLE_COLOR, marginBottom: 24, textAlign: 'center' },
  row:            { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rememberText:   { marginLeft: 8 },
  forgot:         { color: '#2196F3', marginVertical: 12, textAlign: 'right' },
  button:         { paddingVertical: 14, borderRadius: 8, marginBottom: 12, alignItems: 'center' },
  buttonText:     { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  centeredView:   {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView:      {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose:    {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  textStyle:      { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  modalText:      { marginBottom: 12, textAlign: 'center' },
});

export default Login;
