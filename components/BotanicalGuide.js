// components/BotanicalGuide.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const BotanicalGuide = ({ guideData }) => {
  if (!guideData) return null;

  const { title, summary, url, images, sections } = guideData;

  return (
    <View style={styles.card}>
      {/* Título */}
      <View style={styles.infoSection}>
        <Ionicons name="book-outline" size={22} color="#7986CB" style={styles.icon} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.sectionLabel}>Título Botánico:</Text>
          <Text style={styles.sectionText}>{title || 'No disponible'}</Text>
        </View>
      </View>

      {/* Resumen */}
      {summary ? (
        <View style={styles.infoSection}>
          <Ionicons name="reader-outline" size={22} color="#7986CB" style={styles.icon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.sectionLabel}>Resumen:</Text>
            <Text style={[styles.sectionText, styles.summaryText]}>{summary.trim()}</Text>
          </View>
        </View>
      ) : null}

      {/* URL Wikipedia (clickeable) */}
      {url ? (
        <View style={styles.infoSection}>
          <Ionicons name="link-outline" size={22} color="#7986CB" style={styles.icon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.sectionLabel}>Más información:</Text>
            <Text
              style={[styles.sectionText, styles.linkText]}
              onPress={() => Linking.openURL(url)}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {url}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Imágenes (Scroll horizontal) */}
      {images && images.length > 0 ? (
        <View style={[styles.infoSection, { flexDirection: 'column', marginBottom: 20 }]}>
          <Text style={[styles.sectionLabel, { marginLeft: 36, marginBottom: 8 }]}>Imágenes:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16 }}
          >
            {images.map((imgUrl, i) => (
              <Image
                key={i}
                source={{ uri: imgUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Secciones */}
      {sections && Object.keys(sections).length > 0 ? (
        <View style={{ marginTop: 12 }}>
          {Object.entries(sections).map(([sectionKey, sectionText]) => (
            <View key={sectionKey} style={styles.infoSection}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#7986CB"
                style={styles.icon}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.sectionLabel}>
                  {sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}:
                </Text>
                <Text style={[styles.sectionText, styles.sectionBodyText]}>
                  {sectionText.trim()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    marginHorizontal: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    // Sombra suave para iOS
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    // Elevation para Android
    elevation: 5,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  icon: {
    marginRight: 14,
    marginTop: 3,
    width: 26,
  },
  infoTextContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  sectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  summaryText: {
    fontWeight: 'normal',
  },
  linkText: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  image: {
    width: screenWidth * 0.35,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  sectionBodyText: {
    fontWeight: 'normal',
    fontSize: 14,
    color: '#444',
  },
});

export default BotanicalGuide;
