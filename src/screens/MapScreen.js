import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { serviceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { logMap } from '../utils/analytics';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
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
    // Green if status is 'available' or 'active', Red otherwise (null, 'occupied', 'maintenance', etc.)
    const isAvailable = service.status === 'available' || service.status === 'active';
    return isAvailable ? '#4CAF50' : '#F44336'; // Green : Red
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
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={location}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {/* User location marker is handled by showsUserLocation */}

        {/* Service markers */}
        {services.map((service) => {
          const markerColor = getMarkerColor(service);
          const markerLabel = getMarkerLabel(service);
          const isAvailable = service.status === 'available' || service.status === 'active';

          return (
            <Marker
              key={service.serviceId}
              coordinate={{
                latitude: parseFloat(service.latitude),
                longitude: parseFloat(service.longitude),
              }}
              title={`${service.serviceType === 'parking' ? 'Parking' : 'EV Charging'} - ${isAvailable ? 'Available' : 'Not Available'}`}
              description={`${service.address} - $${service.hourlyRate}/hr`}
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

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Nearby Stations</Text>
        <Text style={styles.infoSubtitle}>
          {services.length} location{services.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.legendMarkerText}>P</Text>
          </View>
          <Text style={styles.legendText}>Parking (Available)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.legendMarkerText}>C</Text>
          </View>
          <Text style={styles.legendText}>Charging (Available)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#F44336' }]}>
            <Text style={styles.legendMarkerText}>•</Text>
          </View>
          <Text style={styles.legendText}>Not Available</Text>
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Text style={styles.refreshButtonText}>⟳ Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  legend: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 120,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  legendMarkerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
