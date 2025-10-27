import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentAPI, walletAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function PaymentScreen({ route, navigation }) {
  const { service, fromDate, toDate } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    initiatePayment();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      // Fetch wallet balance from backend
      const response = await walletAPI.getWalletDetails();
      if (response.success && response.data) {
        setWalletBalance(parseFloat(response.data.balance || 0));
      }
    } catch (error) {
      console.warn('Failed to fetch wallet balance:', error);
      // Set to null if wallet not found - user can still proceed
      setWalletBalance(null);
    }
  };

  const initiatePayment = async () => {
    try {
      setLoading(true);

      // Call API with serviceId and datetime range (backend expects these, not sessionId)
      const response = await paymentAPI.initiateFlowPayment(
        service.serviceId,
        fromDate,
        toDate
      );

      if (response.success) {
        setPaymentData(response.data);

        // Fetch actual wallet balance from backend
        await fetchWalletBalance();
      } else {
        Alert.alert('Error', 'Failed to initiate payment');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setLoading(false);

      Alert.alert(
        'Payment Failed',
        error.response?.data?.message || 'Failed to initiate payment. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

      // Navigate back immediately to prevent crash
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!paymentData) return;

    // Check if user has enough balance
    if (walletBalance !== null && walletBalance < paymentData.flowTokenAmount) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${paymentData.flowTokenAmount.toFixed(8)} FLOW but only have ${walletBalance.toFixed(8)} FLOW in your wallet.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Send ${paymentData.flowTokenAmount.toFixed(8)} FLOW tokens to the provider?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => executePayment(),
        },
      ]
    );
  };

  const executePayment = async () => {
    try {
      setPaying(true);

      // Backend will handle the actual blockchain transaction
      // Backend sends real FLOW tokens and generates the transaction hash
      const response = await paymentAPI.executeFlowPayment(
        paymentData.paymentId,
        user.wallet_address
      );

      setPaying(false);

      if (response.success) {
        Alert.alert(
          'Payment Successful!',
          `You have successfully paid ${paymentData.flowTokenAmount.toFixed(8)} FLOW tokens for your booking.`,
          [
            {
              text: 'View Booking',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
                navigation.navigate('MainTabs', { screen: 'History' });
              },
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', 'Failed to process payment');
      }
    } catch (error) {
      setPaying(false);
      console.error('Payment execution error:', error);
      Alert.alert(
        'Payment Failed',
        error.response?.data?.message || 'Failed to execute payment. Please try again.'
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.yellow} />
        <Text style={styles.loadingText}>Preparing payment...</Text>
      </View>
    );
  }

  if (!paymentData) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <Text style={styles.errorText}>Failed to load payment details</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.content}>
        <Text style={styles.title}>Pay with Flow</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service:</Text>
            <Text style={styles.detailValue}>
              {service.serviceType === 'parking' ? 'Parking' : 'Charging Station'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{service.address}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>From:</Text>
            <Text style={styles.detailValue}>{formatDate(fromDate)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>To:</Text>
            <Text style={styles.detailValue}>{formatDate(toDate)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount (USD):</Text>
            <Text style={styles.detailValue}>${paymentData.amountUsd.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Flow Price:</Text>
            <Text style={styles.detailValue}>${paymentData.flowTokenPriceUsd.toFixed(6)}</Text>
          </View>

          <View style={[styles.detailRow, styles.highlightRow]}>
            <Text style={styles.highlightLabel}>Amount to Pay:</Text>
            <Text style={styles.highlightValue}>
              {paymentData.flowTokenAmount.toFixed(8)} FLOW
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.info} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Price locked for 15 minutes at ${paymentData.flowTokenPriceUsd.toFixed(6)} per FLOW
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Wallet</Text>

          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Balance:</Text>
            <Text style={styles.walletBalance}>
              {walletBalance !== null ? `${walletBalance.toFixed(8)} FLOW` : 'Loading...'}
            </Text>
          </View>

          {walletBalance !== null && walletBalance < paymentData.flowTokenAmount && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={COLORS.warning} style={styles.warningIcon} />
              <Text style={styles.warningText}>
                Insufficient balance. You need {paymentData.flowTokenAmount.toFixed(8)} FLOW
              </Text>
            </View>
          )}

          {walletBalance !== null && walletBalance >= paymentData.flowTokenAmount && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} style={styles.successIcon} />
              <Text style={styles.successText}>
                Sufficient balance available
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Provider Wallet</Text>
          <Text style={styles.walletAddress}>{paymentData.providerWalletAddress}</Text>
          <Text style={styles.walletNote}>
            Tokens will be sent to this address
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.payButton,
            (paying || (walletBalance !== null && walletBalance < paymentData.flowTokenAmount)) &&
            styles.payButtonDisabled
          ]}
          onPress={handlePay}
          disabled={paying || (walletBalance !== null && walletBalance < paymentData.flowTokenAmount)}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay {paymentData.flowTokenAmount.toFixed(8)} FLOW
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={paying}
        >
          <Text style={styles.cancelButtonText}>Cancel Payment</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  highlightRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  highlightLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  highlightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
  },
  walletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 16,
    color: '#666',
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#F57C00',
    fontWeight: '600',
  },
  successBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: '#388E3C',
    fontWeight: '600',
  },
  walletAddress: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  walletNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  payButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
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
