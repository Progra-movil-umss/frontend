import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CustomInput from '../components/CustomInput';

const TITLE_COLOR = '#4CAF50';
const DISABLED_COLOR = '#81C784';

const Register = ({ onBack }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [errors, setErrors] = useState({});
    const [valid, setValid] = useState(false);
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        confirm: false,
    });

  useEffect(() => {
    const errs = {};
    if (!username.trim()) errs.username = 'El nombre de usuario es obligatorio';
    if (!email.trim() || !email.includes('@'))
      errs.email = 'Ingrese un correo electrónico válido';
    if (!password || password.length < 6)
      errs.password = 'La contraseña debe tener al menos 6 caracteres';
    if (confirm !== password) errs.confirm = 'Las contraseñas no coinciden';
    setErrors(errs);
    setValid(Object.keys(errs).length === 0);
  }, [username, email, password, confirm]);

  const handleRegister = () => {
    if (!valid) return;
    // Aquí iría la llamada a la API
    console.log({ username, email, password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de datos</Text>
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
        label="Correo electronico"
        placeholder="Ingrese su correo electronico"
        value={email}
        onChangeText={text => {
            setEmail(text);
            if (!touched.email) setTouched({ ...touched, email: true });
        }}
        keyboardType="email-address"
        error={touched.email ? errors.email : ''}
      />
      <CustomInput
        label="Contraseña"
        placeholder="Ingrese su contraseña"
        value={password}
        onChangeText={text => {
            setPassword(text);
            if (!touched.password) setTouched({ ...touched, password: true });
        }}
        secureText
        error={touched.password ? errors.password : ''}
      />
      <CustomInput
        label="Confirmar contraseña"
        placeholder="Repita su contraseña"
        value={confirm}
        onChangeText={text => {
                setConfirm(text);
                if (!touched.confirm) setTouched({ ...touched, confirm: true });
            }}
        secureText
        error={touched.confirm ? errors.confirm : ''}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: valid ? TITLE_COLOR : DISABLED_COLOR }]}
          onPress={handleRegister}
          disabled={!valid}
        >
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} style={styles.backLink}>
          <Text>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: TITLE_COLOR, marginBottom: 24, textAlign: 'center' },
  buttonContainer: { marginTop: 16 },
  button: { paddingVertical: 14, borderRadius: 8, marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  backLink: { alignItems: 'center', marginTop: 8 }
});

export default Register;
