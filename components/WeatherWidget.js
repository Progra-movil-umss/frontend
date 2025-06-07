import React, { useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

const API_KEY = 'e69ae770714553be98bd6ad38077d429';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const getStyles = (isDark) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#333',
    marginLeft: 8,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  description: {
    fontSize: 14,
    color: isDark ? '#ccc' : '#666',
    textTransform: 'capitalize',
  },
  weatherIcon: {
    width: 50,
    height: 50,
  },
  humidity: {
    fontSize: 14,
    color: isDark ? '#ccc' : '#666',
    marginTop: 4,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 8,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

// Componente memoizado para el indicador de carga
const LoadingIndicator = memo(({ isDark }) => (
  <View style={getStyles(isDark).container}>
    <ActivityIndicator size="small" color="#4CAF50" />
  </View>
));

// Componente memoizado para el mensaje de error
const ErrorMessage = memo(({ error, onRetry, isDark }) => (
  <View style={getStyles(isDark).container}>
    <View style={getStyles(isDark).errorContainer}>
      <Ionicons name="location-off" size={24} color="#ff6b6b" style={getStyles(isDark).errorIcon} />
      <Text style={getStyles(isDark).errorText}>{error}</Text>
      <TouchableOpacity style={getStyles(isDark).retryButton} onPress={onRetry}>
        <Text style={getStyles(isDark).retryText}>Activar ubicación</Text>
      </TouchableOpacity>
    </View>
  </View>
));

// Componente memoizado para el contenido del clima
const WeatherContent = memo(({ weather, onPress, isDark }) => {
  const weatherIcon = weather.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
  const styles = getStyles(isDark);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={20} color="#4CAF50" />
        <Text style={styles.location}>{weather.name}</Text>
      </View>

      <View style={styles.weatherContainer}>
        <View style={styles.weatherInfo}>
          <Text style={styles.temperature}>
            {Math.round(weather.main.temp)}°C
          </Text>
          <Text style={styles.description}>
            {weather.weather[0].description}
          </Text>
          <Text style={styles.humidity}>
            Humedad: {weather.main.humidity}%
          </Text>
        </View>
        <Image
          source={{ uri: iconUrl }}
          style={styles.weatherIcon}
        />
      </View>
    </TouchableOpacity>
  );
});

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    getWeather();
  }, []);

  const getWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Se necesita acceso a la ubicación para mostrar el clima');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 5000
      });

      const { latitude, longitude } = location.coords;

      const weatherUrl = new URL(WEATHER_URL);
      const weatherParams = {
        lat: latitude,
        lon: longitude,
        appid: API_KEY,
        units: 'metric',
        lang: 'es'
      };

      Object.entries(weatherParams).forEach(([key, value]) => {
        weatherUrl.searchParams.append(key, value);
      });

      const weatherResponse = await fetch(weatherUrl.toString());
      const weatherData = await weatherResponse.json();

      if (weatherResponse.ok) {
        setWeather(weatherData);
        setLoading(false);
        loadForecast(latitude, longitude);
      } else {
        setError('Error al obtener el clima');
      }
    } catch (err) {
      console.error('Error al obtener el clima:', err);
      setError('Error al obtener el clima');
      setLoading(false);
    }
  };

  const loadForecast = async (latitude, longitude) => {
    try {
      const forecastUrl = new URL(FORECAST_URL);
      const forecastParams = {
        lat: latitude,
        lon: longitude,
        appid: API_KEY,
        units: 'metric',
        lang: 'es'
      };

      Object.entries(forecastParams).forEach(([key, value]) => {
        forecastUrl.searchParams.append(key, value);
      });

      const forecastResponse = await fetch(forecastUrl.toString());
      const forecastData = await forecastResponse.json();

      if (forecastResponse.ok) {
        setForecast(forecastData);
      }
    } catch (err) {
      console.error('Error al cargar el pronóstico:', err);
    }
  };

  const handlePress = () => {
    if (weather && forecast) {
      navigation.navigate('WeatherDetails', { weather, forecast });
    }
  };

  if (loading) return <LoadingIndicator isDark={isDark} />;
  if (error) return <ErrorMessage error={error} onRetry={getWeather} isDark={isDark} />;
  if (!weather) return null;

  return <WeatherContent weather={weather} onPress={handlePress} isDark={isDark} />;
};

export default memo(WeatherWidget); 