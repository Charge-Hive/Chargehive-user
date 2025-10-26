import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { logWallet } from '../utils/analytics';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function WalletScreen() {
  const { user } = useAuth();
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logWallet.screenOpened();
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const { paymentAPI } = require('../services/api');
      const response = await paymentAPI.getUserPaymentHistory();

      if (response.success && response.data) {
        // Transform backend payment data to wallet transaction format
        const formattedTransactions = response.data.payments.map(payment => ({
          id: payment.paymentId,
          type: 'payment',
          amount: payment.amountUsd,
          flowAmount: payment.flowTokenAmount,
          description: `${payment.serviceType === 'parking' ? 'Parking' : 'Charging'} - ${payment.serviceAddress}`,
          date: new Date(payment.createdAt).toISOString().split('T')[0],
          status: payment.status,
          transactionHash: payment.transactionHash,
        }));
        setTransactions(formattedTransactions);
      } else {
        // If no payments, show empty array
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
      // On error, use empty array
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock balance - in a real app, this would come from blockchain
  const balance = '150.00';

  const handleSend = () => {
    logWallet.sendAttempt(recipientAddress, amount);

    if (!recipientAddress || !amount) {
      Alert.alert('Error', 'Please enter recipient address and amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    // In a real app, this would interact with the blockchain
    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} CHV tokens to ${recipientAddress.substring(0, 10)}...?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => logWallet.sendCancelled()
        },
        {
          text: 'Send',
          onPress: () => {
            logWallet.sendSuccess(recipientAddress, amount);
            setShowSendModal(false);
            setRecipientAddress('');
            setAmount('');
            Alert.alert('Success', 'Transaction sent successfully!');
          },
        },
      ]
    );
  };

  const copyAddressToClipboard = async () => {
    await Clipboard.setStringAsync(user.walletAddress);
    logWallet.addressCopied(user.walletAddress);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.content}>
        {/* Wallet Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{balance} CHV</Text>
          <Text style={styles.walletAddress}>
            {user?.walletAddress?.substring(0, 20)}...
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              logWallet.sendModalOpened();
              setShowSendModal(true);
            }}
          >
            <Ionicons name="arrow-up-circle-outline" size={28} color={COLORS.yellow} />
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              logWallet.receiveModalOpened();
              setShowReceiveModal(true);
            }}
          >
            <Ionicons name="arrow-down-circle-outline" size={28} color={COLORS.yellow} />
            <Text style={styles.actionButtonText}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              logWallet.transactionsViewed();
              setShowTransactionsModal(true);
            }}
          >
            <Ionicons name="list-outline" size={28} color={COLORS.yellow} />
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions Preview */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading transactions...</Text>
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            transactions.slice(0, 3).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionType}>
                    {transaction.description || 'Payment'}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, styles.amountNegative]}>
                    ${transaction.amount}
                  </Text>
                  {transaction.flowAmount && (
                    <Text style={styles.flowAmount}>
                      {transaction.flowAmount.toFixed(2)} FLOW
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Send Modal */}
        <Modal
          visible={showSendModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSendModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Send Tokens</Text>

              <TextInput
                style={styles.input}
                placeholder="Recipient Wallet Address"
                placeholderTextColor={COLORS.textPlaceholder}
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Amount (CHV)"
                placeholderTextColor={COLORS.textPlaceholder}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.balanceInfo}>Available: {balance} CHV</Text>

              <TouchableOpacity style={styles.modalButton} onPress={handleSend}>
                <Text style={styles.modalButtonText}>Send</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowSendModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Receive Modal */}
        <Modal
          visible={showReceiveModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowReceiveModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Receive Tokens</Text>

              <View style={styles.qrContainer}>
                <QRCode
                  value={user?.walletAddress || 'No wallet address'}
                  size={200}
                />
              </View>

              <Text style={styles.addressLabel}>Your Wallet Address:</Text>
              <Text style={styles.addressText}>{user?.walletAddress}</Text>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyAddressToClipboard}
              >
                <Text style={styles.copyButtonText}>Copy Address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowReceiveModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Transactions Modal */}
        <Modal
          visible={showTransactionsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTransactionsModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>All Transactions</Text>

              <ScrollView style={styles.transactionsList}>
                {transactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionDetailItem}>
                    <View style={styles.transactionHeader}>
                      <Text style={styles.transactionTypeDetail}>
                        {transaction.type === 'received' && 'Received'}
                        {transaction.type === 'sent' && 'Sent'}
                        {transaction.type === 'payment' && 'Payment'}
                      </Text>
                      <Text style={[
                        styles.transactionAmountDetail,
                        transaction.type === 'received' ? styles.amountPositive : styles.amountNegative
                      ]}>
                        {transaction.type === 'received' ? '+' : '-'}{transaction.amount} CHV
                      </Text>
                    </View>
                    <Text style={styles.transactionInfo}>
                      {transaction.from && `From: ${transaction.from}`}
                      {transaction.to && `To: ${transaction.to}`}
                      {transaction.description && transaction.description}
                    </Text>
                    <Text style={styles.transactionDateDetail}>{transaction.date}</Text>
                    <Text style={styles.transactionStatus}>{transaction.status}</Text>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowTransactionsModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    padding: SPACING.xl,
  },
  balanceCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING['3xl'],
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  balanceLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.base,
    marginBottom: SPACING.sm,
  },
  balanceAmount: {
    color: COLORS.yellow,
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  walletAddress: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.cardBackground,
    flex: 1,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  actionButtonIcon: {
    fontSize: 28,
    color: COLORS.yellow,
    marginBottom: SPACING.sm,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  recentSection: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionType: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  transactionDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  transactionAmount: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  flowAmount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.yellow,
    marginTop: 2,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
    fontStyle: 'italic',
  },
  amountPositive: {
    color: COLORS.success,
  },
  amountNegative: {
    color: COLORS.textSecondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING['2xl'],
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.yellow,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.base,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    color: COLORS.white,
  },
  balanceInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.yellow,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  modalButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.base,
  },
  qrContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  addressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  addressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  copyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  transactionsList: {
    maxHeight: 400,
  },
  transactionDetailItem: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  transactionTypeDetail: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  transactionAmountDetail: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  transactionInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  transactionDateDetail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  transactionStatus: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    textTransform: 'capitalize',
  },
});
