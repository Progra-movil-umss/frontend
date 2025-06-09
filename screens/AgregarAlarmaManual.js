import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const daysOfWeek = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 },
  { label: 'Jue', value: 4 },
  { label: 'Vie', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 7 },
];

const frequencies = [
  { label: 'Una vez', value: 'once' },
  { label: 'Diario', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
];

const reminderTypes = [
  { label: 'Regar', value: 'regar' },
  { label: 'Podar', value: 'podar' },
  { label: 'Fertilizar', value: 'fertilizar' },
  { label: 'Trasplantar', value: 'trasplantar' },
  { label: 'Otros', value: 'otros' },
];

const STORAGE_KEY = 'alarms';

const AgregarAlarmaManual = ({ navigation, route }) => {
  const { plant, garden } = route.params || {};

  const [title, setTitle] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [frequency, setFrequency] = useState('once');
  const [days, setDays] = useState([]);
  const [reminderType, setReminderType] = useState('regar');

  // Nuevo estado para la fecha de la alarma única
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleDay = (dayValue) => {
    if (days.includes(dayValue)) {
      setDays(days.filter(d => d !== dayValue));
    } else {
      setDays([...days, dayValue]);
    }
  };

  // Manejador del cambio de fecha en el DatePicker
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // en iOS mantiene el picker visible
    if (selectedDate) {
      setDate(selectedDate);
      setHour(selectedDate.getHours().toString());
      setMinute(selectedDate.getMinutes().toString().padStart(2, '0'));
    }
  };

  const saveAlarm = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    const h = parseInt(hour);
    const m = parseInt(minute);
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert('Error', 'Hora o minuto inválidos');
      return;
    }

    if (frequency === 'weekly' && days.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un día para frecuencia semanal');
      return;
    }

    if (frequency === 'once') {
      const now = new Date();
      const alarmDate = new Date(date);
      alarmDate.setHours(h, m, 0, 0);
      if (alarmDate <= now) {
        Alert.alert('Error', 'La fecha y hora de la alarma deben ser futuras');
        return;
      }
    }

    const newAlarm = {
      id: Date.now().toString(),
      title,
      hour: h,
      minute: m,
      frequency,
      days: frequency === 'weekly' ? days : [],
      date: frequency === 'once' ? new Date(date.setHours(h, m, 0, 0)).toISOString() : null,
      plantId: plant?.id || null,
      gardenId: garden?.id || null,
      type: reminderType,
      description: '',
    };

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const arr = stored ? JSON.parse(stored) : [];
      arr.push(newAlarm);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      Alert.alert('Guardado', 'Alarma agregada manualmente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      console.log('Alarmas guardadas:', arr);

    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la alarma');
      console.error(e);
    }
  };

  if (!plant || !garden) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Faltan datos de la planta o el jardín.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Recordatorio manual"
        value={title}
        onChangeText={setTitle}
      />

      {frequency === 'once' && (
        <>
          <Text style={styles.label}>Selecciona la fecha</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, { justifyContent: 'center' }]}
          >
            <Text>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
              minimumDate={new Date()}
            />
          )}
        </>
      )}

      <Text style={styles.label}>Hora (0-23)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={hour}
        onChangeText={setHour}
        maxLength={2}
      />

      <Text style={styles.label}>Minuto (0-59)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={minute}
        onChangeText={setMinute}
        maxLength={2}
      />

      <Text style={styles.label}>Frecuencia</Text>
      <View style={styles.freqRow}>
        {frequencies.map(freq => (
          <TouchableOpacity
            key={freq.value}
            style={[styles.freqButton, frequency === freq.value && styles.freqButtonSelected]}
            onPress={() => {
              setFrequency(freq.value);
              if (freq.value !== 'weekly') setDays([]);
            }}
          >
            <Text style={frequency === freq.value ? styles.freqTextSelected : styles.freqText}>{freq.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {frequency === 'weekly' && (
        <>
          <Text style={styles.label}>Días de la semana</Text>
          <View style={styles.daysRow}>
            {daysOfWeek.map(day => (
              <TouchableOpacity
                key={day.value}
                style={[styles.dayButton, days.includes(day.value) && styles.dayButtonSelected]}
                onPress={() => toggleDay(day.value)}
              >
                <Text style={days.includes(day.value) ? styles.dayTextSelected : styles.dayText}>{day.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Tipo de recordatorio</Text>
      <View style={styles.freqRow}>
        {reminderTypes.map(type => (
          <TouchableOpacity
            key={type.value}
            style={[styles.freqButton, reminderType === type.value && styles.freqButtonSelected]}
            onPress={() => setReminderType(type.value)}
          >
            <Text style={reminderType === type.value ? styles.freqTextSelected : styles.freqText}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveAlarm}>
        <Text style={styles.saveButtonText}>Guardar alarma manual</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'stretch',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
  },
  freqRow: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  freqButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginTop: 6,
  },
  freqButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  freqText: {
    color: '#4CAF50',
  },
  freqTextSelected: {
    color: '#fff',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  dayButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 6,
  },
  dayButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  dayText: {
    color: '#4CAF50',
  },
  dayTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 25,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AgregarAlarmaManual;
