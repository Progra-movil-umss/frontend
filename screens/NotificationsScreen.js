import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import NotificationCard from '../components/NotificationCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function NotificationsScreen() {
  const [expiredAlarms, setExpiredAlarms] = useState([]);

  const loadExpiredAlarms = async () => {
  try {
    const alarmsJson = await AsyncStorage.getItem('alarms');
    const plantsJson = await AsyncStorage.getItem('plants');  // Cargar plantas
  
    if (!alarmsJson) {
      setExpiredAlarms([]);
      return;
    }

    const allAlarms = JSON.parse(alarmsJson);
    const plants = plantsJson ? JSON.parse(plantsJson) : [];

    const now = new Date();

    // Filtrar alarmas expiradas no vistas
    const expired = allAlarms.filter((alarm) => {
      if (!alarm) return false;
      const { frequency, date, hour, minute, days, reviewed } = alarm;
      if (reviewed) return false;

      let alarmDate;
      if (frequency === 'once') {
        alarmDate = date ? new Date(date) : new Date();
        alarmDate.setHours(hour ?? 0);
        alarmDate.setMinutes(minute ?? 0);
        alarmDate.setSeconds(0);
        alarmDate.setMilliseconds(0);
      } else if (frequency === 'daily') {
        alarmDate = new Date();
        alarmDate.setHours(hour ?? 0);
        alarmDate.setMinutes(minute ?? 0);
        alarmDate.setSeconds(0);
        alarmDate.setMilliseconds(0);
      } else if (frequency === 'weekly') {
        if (!Array.isArray(days) || days.length === 0) return false;
        const todayDay = new Date().getDay();
        if (!days.includes(todayDay)) return false;
        alarmDate = new Date();
        alarmDate.setHours(hour ?? 0);
        alarmDate.setMinutes(minute ?? 0);
        alarmDate.setSeconds(0);
        alarmDate.setMilliseconds(0);
      } else {
        return false;
      }

      return alarmDate <= now;
    });

    // Asociar alias de planta a cada alarma
    const expiredWithPlantAlias = expired.map(alarm => {
      const plant = plants.find(p => p.id === alarm.plantId);
      return { ...alarm, plantAlias: plant ? plant.alias : 'Desconocida' };
    });

    // Ordenar
    expiredWithPlantAlias.sort((a, b) => {
      const getAlarmDate = (alarm) => {
        if (alarm.frequency === 'once' && alarm.date) {
          const d = new Date(alarm.date);
          d.setHours(alarm.hour ?? 0);
          d.setMinutes(alarm.minute ?? 0);
          d.setSeconds(0);
          d.setMilliseconds(0);
          return d;
        }
        const d = new Date();
        d.setHours(alarm.hour ?? 0);
        d.setMinutes(alarm.minute ?? 0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
      };
      return getAlarmDate(b) - getAlarmDate(a);
    });

    setExpiredAlarms(expiredWithPlantAlias);
  } catch (error) {
    console.error('Error cargando alarmas:', error);
  }
};

  const markAsReviewed = async (alarmId) => {
    try {
      const alarmsJson = await AsyncStorage.getItem('alarms');
      if (!alarmsJson) return;
      const allAlarms = JSON.parse(alarmsJson);

      const updatedAlarms = allAlarms.map(alarm =>
        alarm.id === alarmId ? { ...alarm, reviewed: true } : alarm
      );

      await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
      loadExpiredAlarms();
    } catch (error) {
      console.error('Error marcando alarma como vista:', error);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      loadExpiredAlarms();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Notificaciones</Text>
        {expiredAlarms.length === 0 ? (
          <Text>No tienes alarmas vencidas ni actuales.</Text>
        ) : (
          expiredAlarms.map((alarm) => (
            
            <NotificationCard
              key={alarm.id}
              alarm={alarm}
              plantAlias={alarm.plantAlias}
              reviewed={alarm.reviewed}
              onPress={() => markAsReviewed(alarm.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'green', marginBottom: 20, textAlign: 'center',color: '#4CAF50' },


});
