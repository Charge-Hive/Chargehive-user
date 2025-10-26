import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { sessionAPI } from '../services/api';
import { logBooking } from '../utils/analytics';

export default function BookingScreen({ route, navigation }) {
  const { service } = route.params;
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date(Date.now() + 3600000)); // 1 hour later
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'flow'

  useEffect(() => {
    logBooking.screenOpened(service.serviceId, service.serviceType);
  }, []);

  const calculateTotalAmount = () => {
    const hours = Math.ceil((toDate - fromDate) / (1000 * 60 * 60));
    const hourlyRate = parseFloat(service.hourlyRate || 10);
    return (hours * hourlyRate).toFixed(2);
  };

  const calculateDuration = () => {
    const diff = toDate - fromDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleBooking = async () => {
    const totalAmount = calculateTotalAmount();
    logBooking.bookingAttempt(service.serviceId, fromDate, toDate, totalAmount);

    if (fromDate >= toDate) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    if (fromDate < new Date()) {
      Alert.alert('Error', 'Cannot book a session in the past');
      return;
    }

    setLoading(true);

    try {
      const response = await sessionAPI.bookSession(
        service.serviceId,
        fromDate.toISOString(),
        toDate.toISOString()
      );

      setLoading(false);

      if (response.success) {
        logBooking.bookingSuccess(service.serviceId, response.data?.sessionId, totalAmount);

        // If Flow payment selected, navigate to payment screen
        if (paymentMethod === 'flow') {
          navigation.navigate('Payment', {
            sessionId: response.data.sessionId,
            service: service,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
            totalAmount: totalAmount,
          });
        } else {
          // Card payment (placeholder for now)
          Alert.alert(
            'Success',
            'Session booked successfully! Card payment processing...',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } else {
        logBooking.bookingFailed(service.serviceId, 'Failed to book session');
        Alert.alert('Error', 'Failed to book session');
      }
    } catch (error) {
      setLoading(false);
      logBooking.bookingFailed(service.serviceId, error);
      Alert.alert(
        'Booking Failed',
        error.response?.data?.message || 'Failed to book session. Please try again.'
      );
    }
  };

  const onFromDateChange = (event, selectedDate) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (selectedDate) {
      logBooking.dateSelected('From', selectedDate);
      setFromDate(selectedDate);
      // Auto-adjust toDate if it's before the new fromDate
      if (selectedDate >= toDate) {
        setToDate(new Date(selectedDate.getTime() + 3600000));
      }
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToPicker(Platform.OS === 'ios');
    if (selectedDate) {
      logBooking.dateSelected('To', selectedDate);
      setToDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Book Session</Text>

        <View style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <View style={[
              styles.badge,
              { backgroundColor: service.serviceType === 'parking' ? '#FF6B6B' : '#4ECDC4' }
            ]}>
              <Text style={styles.badgeText}>
                {service.serviceType === 'parking' ? 'P' : 'C'}
              </Text>
            </View>
            <Text style={styles.serviceType}>
              {service.serviceType === 'parking' ? 'Parking' : 'Charging Station'}
            </Text>
          </View>

          <Text style={styles.serviceAddress}>{service.address}</Text>
          <Text style={styles.serviceLocation}>
            {service.city}, {service.state}, {service.country}
          </Text>
          <Text style={styles.serviceRate}>${service.hourlyRate}/hour</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>

          <View style={styles.dateTimeRow}>
            <Text style={styles.label}>From:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowFromPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {fromDate.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>

          {showFromPicker && (
            <DateTimePicker
              value={fromDate}
              mode="datetime"
              display="default"
              onChange={onFromDateChange}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.dateTimeRow}>
            <Text style={styles.label}>To:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowToPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {toDate.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>

          {showToPicker && (
            <DateTimePicker
              value={toDate}
              mode="datetime"
              display="default"
              onChange={onToDateChange}
              minimumDate={fromDate}
            />
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>{calculateDuration()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate:</Text>
            <Text style={styles.summaryValue}>${service.hourlyRate}/hour</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>${calculateTotalAmount()}</Text>
          </View>
        </View>

        <View style={styles.paymentMethodSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.paymentOptionSelected,
              ]}
              onPress={() => {
                setPaymentMethod('card');
                logBooking.paymentMethodSelected('card');
              }}
            >
              <View style={styles.paymentOptionContent}>
                <Text style={styles.paymentOptionIcon}>💳</Text>
                <Text style={[
                  styles.paymentOptionText,
                  paymentMethod === 'card' && styles.paymentOptionTextSelected,
                ]}>
                  Credit Card
                </Text>
              </View>
              {paymentMethod === 'card' && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'flow' && styles.paymentOptionSelected,
              ]}
              onPress={() => {
                setPaymentMethod('flow');
                logBooking.paymentMethodSelected('flow');
              }}
            >
              <View style={styles.paymentOptionContent}>
                <Text style={styles.paymentOptionIcon}>🌊</Text>
                <Text style={[
                  styles.paymentOptionText,
                  paymentMethod === 'flow' && styles.paymentOptionTextSelected,
                ]}>
                  Flow Token
                </Text>
              </View>
              {paymentMethod === 'flow' && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>
              {paymentMethod === 'flow' ? 'Book & Pay with Flow' : 'Confirm Booking'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  serviceLocation: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  serviceRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  dateTimeRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  paymentMethodSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  paymentOption: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  paymentOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  paymentOptionContent: {
    alignItems: 'center',
  },
  paymentOptionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  paymentOptionTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    marginTop: 8,
  },
  bookButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
