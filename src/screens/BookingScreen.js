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
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { sessionAPI } from '../services/api';
import { logBooking } from '../utils/analytics';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.content}>
        {/* Drag Indicator */}
        <View style={styles.dragIndicator} />

        <View style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <View style={[
              styles.badge,
              { backgroundColor: service.serviceType === 'parking' ? COLORS.parking : COLORS.charging }
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
              display="compact"
              onChange={onFromDateChange}
              minimumDate={new Date()}
              textColor={COLORS.white}
              themeVariant="dark"
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
              display="compact"
              onChange={onToDateChange}
              minimumDate={fromDate}
              textColor={COLORS.white}
              themeVariant="dark"
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
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={COLORS.white}
                  style={styles.paymentOptionIcon}
                />
                <Text style={[
                  styles.paymentOptionLabel,
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
                <Text style={styles.paymentOptionText}>F</Text>
                <Text style={[
                  styles.paymentOptionLabel,
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
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray400,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  serviceCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  serviceType: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  serviceAddress: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  serviceLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  serviceRate: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.yellow,
  },
  section: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  dateTimeRow: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  dateButton: {
    backgroundColor: COLORS.inputBackground,
    padding: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
  },
  totalRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalAmount: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.yellow,
  },
  paymentMethodSection: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  paymentOption: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  paymentOptionSelected: {
    borderColor: COLORS.yellow,
    backgroundColor: COLORS.cardBackground,
  },
  paymentOptionContent: {
    alignItems: 'center',
  },
  paymentOptionIcon: {
    marginBottom: SPACING.xs,
  },
  paymentOptionText: {
    fontSize: 24,
    marginBottom: SPACING.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  paymentOptionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  paymentOptionTextSelected: {
    color: COLORS.yellow,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.yellow,
    marginTop: SPACING.sm,
  },
  bookButton: {
    backgroundColor: COLORS.yellow,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.gray600,
    opacity: 0.6,
  },
  bookButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
});
