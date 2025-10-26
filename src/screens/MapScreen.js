import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  Platform,
  StatusBar,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { serviceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { logMap } from '../utils/analytics';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    logMap.screenOpened();
    loadLocation();
    loadServices();
  }, []);

  const loadLocation = async () => {
    try {
      logMap.locationPermissionRequested();
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        logMap.locationPermissionDenied();
        Alert.alert('Permission Denied', 'Location permission is required to use this app');
        // Set default location (San Francisco)
        setLocation({
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLoading(false);
        return;
      }

      logMap.locationPermissionGranted();
      const userLocation = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setLocation(newLocation);
      logMap.userLocationFound(newLocation.latitude, newLocation.longitude);
    } catch (error) {
      // Set default location if unable to get user location
      setLocation({
        latitude: 37.7749, // San Francisco
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await serviceAPI.getAllServices();
      if (response.success && response.data && response.data.length > 0) {
        setServices(response.data);
        logMap.servicesLoaded(response.data.length, 'backend');
        console.log('📍 Loaded services from backend:', response.data.map(s => ({
          type: s.serviceType,
          status: s.status,
          address: s.address
        })));
      } else {
        // If no data from backend, use demo data
        const demoData = getDemoServices();
        setServices(demoData);
        logMap.servicesLoaded(demoData.length, 'demo');
      }
    } catch (error) {
      // On error, use demo data so the app still works
      const demoData = getDemoServices();
      setServices(demoData);
      logMap.servicesLoaded(demoData.length, 'demo');
      Alert.alert(
        'Demo Mode',
        'Could not connect to backend. Showing demo parking and charging locations.',
        [{ text: 'OK' }]
      );
    }
  };

  const getDemoServices = () => {
    // Demo data centered around San Francisco
    return [
      {
        serviceId: 'demo-p1',
        serviceType: 'parking',
        address: '123 Market Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        latitude: '37.7749',
        longitude: '-122.4194',
        hourlyRate: '15',
        status: 'available',
        description: 'Downtown parking facility',
      },
      {
        serviceId: 'demo-c1',
        serviceType: 'charger',
        address: '456 Mission Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        latitude: '37.7849',
        longitude: '-122.4094',
        hourlyRate: '20',
        status: 'available',
        description: 'Fast charging station',
      },
      {
        serviceId: 'demo-p2',
        serviceType: 'parking',
        address: '789 Howard Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        latitude: '37.7649',
        longitude: '-122.4294',
        hourlyRate: '12',
        status: 'available',
        description: 'Covered parking',
      },
      {
        serviceId: 'demo-c2',
        serviceType: 'charger',
        address: '321 Folsom Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        latitude: '37.7799',
        longitude: '-122.4144',
        hourlyRate: '18',
        status: 'available',
        description: 'Level 2 charging',
      },
    ];
  };

  const getMarkerColor = (service) => {
    // Use theme colors: Yellow for available chargers, Blue for available parking, Gray for unavailable
    const isAvailable = service.status === 'available' || service.status === 'active';
    if (!isAvailable) return COLORS.gray500;
    return service.serviceType === 'parking' ? COLORS.parking : COLORS.charging;
  };

  const getMarkerLabel = (service) => {
    // 'P' for parking, 'C' for charger
    return service.serviceType === 'parking' ? 'P' : 'C';
  };

  const handleMarkerPress = (service) => {
    logMap.markerClicked(service.serviceId, service.serviceType, service.address);

    // Check if service is available or active before allowing booking
    const isAvailable = service.status === 'available' || service.status === 'active';
    if (!isAvailable) {
      Alert.alert(
        'Service Unavailable',
        `This ${service.serviceType === 'parking' ? 'parking spot' : 'charging station'} is currently ${service.status || 'not available'}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (isAuthenticated) {
      navigation.navigate('BookingModal', { service });
    } else {
      Alert.alert(
        'Login Required',
        'Please login to book a session',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
    }
  };

  const handleRefresh = () => {
    logMap.mapRefreshed();
    loadLocation();
    loadServices();
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.yellow} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Map</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowLegend(true)}
          >
            <Ionicons name="information-circle-outline" size={24} color={COLORS.yellow} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh-outline" size={24} color={COLORS.yellow} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={location}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {/* Service markers */}
        {services.map((service) => {
          const markerColor = getMarkerColor(service);
          const markerLabel = getMarkerLabel(service);

          return (
            <Marker
              key={service.serviceId}
              coordinate={{
                latitude: parseFloat(service.latitude),
                longitude: parseFloat(service.longitude),
              }}
              onPress={() => handleMarkerPress(service)}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: markerColor }
              ]}>
                <Text style={styles.markerText}>{markerLabel}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Horizontal Scrollable Location Cards */}
      <View style={styles.locationCardsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {services.map((service) => {
            const isAvailable = service.status === 'available' || service.status === 'active';
            return (
              <TouchableOpacity
                key={service.serviceId}
                style={styles.locationCard}
                onPress={() => handleMarkerPress(service)}
              >
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.cardBadge,
                    { backgroundColor: service.serviceType === 'parking' ? COLORS.parking : COLORS.charging }
                  ]}>
                    <Text style={styles.cardBadgeText}>
                      {service.serviceType === 'parking' ? 'P' : 'C'}
                    </Text>
                  </View>
                  <View style={styles.cardPrice}>
                    <Text style={styles.priceText}>${service.hourlyRate}/hr</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {service.address}
                </Text>
                <Text style={styles.cardLocation}>
                  {service.city}, {service.state}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: isAvailable ? COLORS.success : COLORS.gray600 }
                ]}>
                  <Text style={styles.statusText}>
                    {isAvailable ? 'Available' : 'Not Available'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Legend Modal */}
      <Modal
        visible={showLegend}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLegend(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLegend(false)}
        >
          <View style={styles.legendModal}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.parking }]} />
              <Text style={styles.legendLabel}>Parking Available</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.charging }]} />
              <Text style={styles.legendLabel}>Charging Available</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.gray500 }]} />
              <Text style={styles.legendLabel}>Unavailable</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLegend(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.85; // 85% of screen width
const isSmallScreen = screenWidth < 375; // iPhone SE and similar

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? SPACING.md : SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? (isSmallScreen ? 50 : 60) : 20,
    paddingBottom: isSmallScreen ? SPACING.sm : SPACING.md,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerLeft: {
    width: isSmallScreen ? 70 : 96, // Adjusted for small screens
  },
  headerTitle: {
    fontSize: isSmallScreen ? FONT_SIZES.lg : FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.yellow,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: isSmallScreen ? SPACING.sm : SPACING.md,
    width: isSmallScreen ? 70 : 96,
  },
  infoButton: {
    padding: SPACING.sm,
  },
  refreshButton: {
    padding: SPACING.sm,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  markerText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  locationCardsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  scrollContent: {
    paddingHorizontal: isSmallScreen ? SPACING.sm : SPACING.lg,
  },
  locationCard: {
    backgroundColor: COLORS.cardBackground,
    padding: isSmallScreen ? SPACING.md : SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginRight: SPACING.md,
    width: cardWidth,
    height: isSmallScreen ? 140 : 160,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallScreen ? SPACING.xs : SPACING.sm,
  },
  cardBadge: {
    width: isSmallScreen ? 28 : 32,
    height: isSmallScreen ? 28 : 32,
    borderRadius: isSmallScreen ? 14 : 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadgeText: {
    color: COLORS.white,
    fontSize: isSmallScreen ? FONT_SIZES.sm : FONT_SIZES.base,
    fontWeight: 'bold',
  },
  cardPrice: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  priceText: {
    color: COLORS.primary,
    fontSize: isSmallScreen ? FONT_SIZES.xs : FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: isSmallScreen ? FONT_SIZES.sm : FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  cardLocation: {
    fontSize: isSmallScreen ? FONT_SIZES.xs : FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: isSmallScreen ? SPACING.xs : SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendModal: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginHorizontal: SPACING['2xl'],
    minWidth: 250,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legendTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.yellow,
    marginBottom: SPACING.lg,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  legendLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
  },
  closeButton: {
    backgroundColor: COLORS.yellow,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
});
