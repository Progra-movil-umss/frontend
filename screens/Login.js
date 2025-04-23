import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CustomInput from '../components/CustomInput';
import Checkbox from '../components/Checkbox';

const TITLE_COLOR = '#4CAF50';
const DISABLED_COLOR = '#81C784';

const Login = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });
  

  useEffect(() => {
    const errs = {};
    if (!username.trim()) errs.username = 'El usuario es obligatorio';
    if (!password) errs.password = 'La contraseña es obligatoria';
    setErrors(errs);
    setValid(Object.keys(errs).length === 0);
  }, [username, password]);

  const handleLogin = () => {
    if (!valid) return;
    // Aquí iría la llamada a la API
    console.log({ username, password, remember });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio de Sesión</Text>
      <CustomInput
        label="Usuario"
        placeholder="Ingrese su usuario"
        value={username}
        onChangeText={text => {
            setUsername(text);
            if (!touched.username) setTouched({ ...touched, username: true });
        }}
        error={touched.username ? errors.username : ''}
      />
      <CustomInput
        label="Contraseña"
        placeholder="Ingrese su contraseña"
        value={password}
        onChangeText={text => {
            if (!touched.password) setTouched({ ...touched, password: true });
            setPassword(text);
        }}
        secureText
        error={touched.password ? errors.password : ''}
      />
      <View style={styles.row}>        
        <Checkbox checked={remember} onToggle={() => setRemember((r) => !r)} />
        <Text style={styles.rememberText}>Recordar contraseña</Text>
      </View>
      <TouchableOpacity>
        <Text style={styles.forgot}>Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: valid ? TITLE_COLOR : DISABLED_COLOR }]}
        onPress={handleLogin}
        disabled={!valid}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: TITLE_COLOR }]}
        onPress={onRegister}
      >
        <Text style={styles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: TITLE_COLOR, marginBottom: 24, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rememberText: { marginLeft: 8 },
  forgot: { color: '#2196F3', marginVertical: 12, textAlign: 'right' },
  button: { paddingVertical: 14, borderRadius: 8, marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});

export default Login;