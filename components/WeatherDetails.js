import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Mapping OpenWeatherMap icon codes to MaterialCommunityIcons names
const weatherIconMap = {
  '01d': 'weather-sunny', // clear sky day
  '01n': 'weather-night', // clear sky night
  '02d': 'weather-partly-cloudy', // few clouds day
  '02n': 'weather-night-partly-cloudy', // few clouds night
  '03d': 'weather-cloudy', // scattered clouds day
  '03n': 'weather-cloudy', // scattered clouds night
  '04d': 'weather-cloudy', // broken clouds day
  '04n': 'weather-cloudy', // broken clouds night
  '09d': 'weather-showers-scattered', // shower rain day
  '09n': 'weather-showers-scattered', // shower rain night
  '10d': 'weather-rainy', // rain day
  '10n': 'weather-rainy', // rain night
  '11d': 'weather-lightning', // thunderstorm day
  '11n': 'weather-lightning', // thunderstorm night
  '13d': 'weather-snowy', // snow day
  '13n': 'weather-snowy', // snow night
  '50d': 'weather-fog', // mist day
  '50n': 'weather-fog', // mist night
};

// Function to get MaterialCommunityIcons name from OpenWeatherMap icon code
const getWeatherIconName = (iconCode) => {
  return weatherIconMap[iconCode] || 'weather-alert'; // Fallback to a generic weather alert icon
};

const WeatherDetails = ({ route }) => {
  const { weather, forecast: initialForecast } = route.params;
  const [forecast, setForecast] = useState(initialForecast);
  const [loadingForecast, setLoadingForecast] = useState(!initialForecast);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (!forecast && weather) {
       setLoadingForecast(false);
    } else if (forecast) {
       setLoadingForecast(false);
    }
  }, [forecast, weather]);

  const getForecastForNextHours = () => {
    if (!forecast || !forecast.list) return [];
    // Take the next 8 forecast entries (24 hours as they are 3 hours apart)
    return forecast.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).getHours() + ':00',
      temp: Math.round(item.main.temp),
      iconCode: item.weather[0].icon, // Keep the icon code
      description: item.weather[0].description,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed
    }));
  };

  const getForecastForNextDays = () => {
    if (!forecast || !forecast.list) return [];

    const dailyForecasts = {};
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('es-ES', { weekday: 'long', timeZoneName: 'short' });

      if (!dailyForecasts[day]) {
        dailyForecasts[day] = {
          day,
          iconCode: item.weather[0].icon, // Keep the icon code
          minTemp: item.main.temp,
          maxTemp: item.main.temp,
          windSpeed: item.wind.speed
        };
      } else {
        dailyForecasts[day].minTemp = Math.min(dailyForecasts[day].minTemp, item.main.temp);
        dailyForecasts[day].maxTemp = Math.max(dailyForecasts[day].maxTemp, item.main.temp);
      }
    });

    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', timeZoneName: 'short' });
    const dailyForecastsArray = Object.values(dailyForecasts);
    
    const todayIndex = dailyForecastsArray.findIndex(dayData => dayData.day === today);
    
    const startIndex = (todayIndex !== -1 && dailyForecastsArray.length > 1) ? todayIndex + 1 : 0;

    return dailyForecastsArray.slice(startIndex, startIndex + 5).map(dayData => ({
        ...dayData,
        tempRange: `${Math.round(dayData.minTemp)}° / ${Math.round(dayData.maxTemp)}°`,
        windSpeed: Math.round(dayData.windSpeed)
    }));
  };

  // Get current weather icon code and corresponding MaterialCommunityIcons name
  const weatherIconCode = weather?.weather?.[0]?.icon;
  const mainWeatherIconName = getWeatherIconName(weatherIconCode);

  // Get forecast data
  const hourlyForecast = getForecastForNextHours();
  const dailyForecast = getForecastForNextDays();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#111' : '#f5f5f5',
    },
    card: {
      backgroundColor: isDark ? '#222' : 'white',
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
      marginBottom: 16,
    },
    location: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#333',
      marginLeft: 8,
    },
    currentWeather: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    weatherIcon: {
      width: 80,
      height: 80,
      marginRight: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    temperatureContainer: {

    },
    temperature: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    description: {
      fontSize: 16,
      color: isDark ? '#bbb' : '#666',
      textTransform: 'capitalize',
    },
    detailsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#333' : '#eee',
      paddingTop: 16,
    },
    detail: {
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 12,
      color: isDark ? '#bbb' : '#666',
      marginTop: 4,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#333',
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#333',
      marginBottom: 16,
    },
    // Hourly forecast styles
    forecastScroll: {
      paddingRight: 16,
    },
    forecastItem: {
      alignItems: 'center',
      marginRight: 15, // Reduced margin slightly
      width: 70, // Reduced width slightly
    },
    forecastTime: {
      fontSize: 13, // Reduced font size slightly
      color: isDark ? '#bbb' : '#666',
      marginBottom: 4,
    },
     // Style for Hourly Vector Icons
    forecastVectorIcon: {
      width: 35, // Match Image size
      height: 35, // Match Image size
      marginVertical: 4,
    },
    forecastTemp: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    forecastDescription: {
      fontSize: 10,
      color: isDark ? '#bbb' : '#666',
      textAlign: 'center',
      marginTop: 2,
    },
     hourlyWindDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
     },
      windIconHourly: {
         width: 16,
         height: 16,
         marginRight: 2,
      },
       windTextHourly: {
          fontSize: 12,
          color: isDark ? '#bbb' : '#666',
       },

    dailyForecastItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#eee',
    },
    dailyForecastDay: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#333',
      width: 100,
    },
    dailyForecastDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1, 
      justifyContent: 'flex-end',
    },

     dailyForecastVectorIcon: {
        width: 30,
        height: 30,
        marginRight: 8,
     },
     windDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
     },
     windIconDaily: {
        width: 20,
        height: 20,
        marginRight: 4,
     },
     windText: {
        fontSize: 14,
        color: isDark ? '#bbb' : '#666',
     },
    dailyForecastTemp: {
      fontSize: 16,
      color: isDark ? '#bbb' : '#666',
      width: 80,
      textAlign: 'right',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Current Weather Details */}
        <View style={styles.locationContainer}>
           <Ionicons name="location" size={24} color="#4CAF50" />
          <Text style={styles.location}>{weather?.name || 'Cargando...'}</Text>
        </View>

        {weather ? (
          <View style={styles.currentWeather}>
            {/* Main Weather Icon (using MaterialCommunityIcons)*/}
            <MaterialCommunityIcons 
               name={mainWeatherIconName || 'weather-alert'}
               size={styles.weatherIcon.width}
               color={isDark ? '#fff' : '#333'}
               style={styles.weatherIcon}
            />
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>
                {Math.round(weather.main.temp)}°C
              </Text>
              <Text style={styles.description}>
                {weather.weather[0].description}
              </Text>
            </View>
          </View>
        ) : (
          <ActivityIndicator size="large" color="#4CAF50" /> // Show loader if weather not loaded
        )}

        {weather && ( // Only show details if weather is loaded
          <View style={styles.detailsContainer}>
            {/* Humidity */}
            <View style={styles.detail}>
              <Ionicons name="water" size={24} color="#4CAF50" />
              <Text style={styles.detailValue}>{weather.main.humidity}%</Text>
              <Text style={styles.detailLabel}>Humedad</Text>
            </View>
            {/* Feels Like */}
            <View style={styles.detail}>
              <Ionicons name="thermometer" size={24} color="#4CAF50" />
              <Text style={styles.detailValue}>{Math.round(weather.main.feels_like)}°C</Text>
              <Text style={styles.detailLabel}>Sensación</Text>
            </View>
            {/* Wind - Current */}
            <View style={styles.detail}>
              {/* Using MaterialCommunityIcons for Wind */}
              <MaterialCommunityIcons name="weather-windy" size={24} color="#4CAF50" />
              <Text style={styles.detailValue}>{Math.round(weather.wind.speed)} m/s</Text>
              <Text style={styles.detailLabel}>Viento</Text>
            </View>
          </View>
        )}
      </View>

      {/* Hourly Forecast */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pronóstico por horas</Text>
        {loadingForecast ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : hourlyForecast.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastScroll}
          >
            {hourlyForecast.map((item, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastTime}>{item.time}</Text>
                {/* Weather Icon - Hourly (using MaterialCommunityIcons)*/}
                <MaterialCommunityIcons 
                   name={getWeatherIconName(item.iconCode)} 
                   size={styles.forecastVectorIcon.width} // Use width/height from style object
                   color={isDark ? '#fff' : '#333'} // Adjust color for dark mode
                   style={styles.forecastVectorIcon}
                />
                {/* Removed iconCodeText */}
                <Text style={styles.forecastTemp}>{item.temp}°</Text>
                <Text style={styles.forecastDescription} numberOfLines={1}>
                  {item.description}
                </Text>
                 {/* Wind - Hourly */}
                <View style={styles.hourlyWindDetails}>
                     {/* Using MaterialCommunityIcons for Wind */}
                     <MaterialCommunityIcons name="weather-windy" size={16} color={isDark ? '#bbb' : '#666'} />
                     <Text style={styles.windTextHourly}>
                       {item.windSpeed} m/s
                     </Text>
                   </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={{ color: isDark ? '#bbb' : '#666', textAlign: 'center' }}>No hay datos de pronóstico por horas disponibles.</Text>
        )}
      </View>

      {/* Daily Forecast */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pronóstico por días</Text>
        {loadingForecast ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : dailyForecast.length > 0 ? (
           dailyForecast.map((item, index) => (
            <View key={index} style={styles.dailyForecastItem}>
              <Text style={styles.dailyForecastDay}>{item.day}</Text>
               <View style={styles.dailyForecastDetails}>
                 {/* Weather Icon - Daily (using MaterialCommunityIcons)*/}
                 <MaterialCommunityIcons 
                    name={getWeatherIconName(item.iconCode)}
                    size={styles.dailyForecastVectorIcon.width} // Use width/height from style object
                    color={isDark ? '#fff' : '#333'} // Adjust color for dark mode
                    style={styles.dailyForecastVectorIcon}
                 />
                 {/* Removed iconCodeText */}
                 {/* Wind - Daily */}
                 <View style={styles.windDetails}>
                    {/* Using MaterialCommunityIcons for Wind */}
                    <MaterialCommunityIcons name="weather-windy" size={20} color={isDark ? '#bbb' : '#666'} />
                    <Text style={styles.windText}>{item.windSpeed} m/s</Text>
                 </View>
                 {/* Temperature Range - Daily */}
                 <Text style={styles.dailyForecastTemp}>{item.tempRange}</Text>
               </View>
            </View>
          ))
        ) : (
           <Text style={{ color: isDark ? '#bbb' : '#666', textAlign: 'center' }}>No hay datos de pronóstico por días disponibles.</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default WeatherDetails; 