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
  const [balance, setBalance] = useState('0.00');
  const [chtBalance, setChtBalance] = useState('0.00');
  const [walletAddress, setWalletAddress] = useState('');
  const [sendingTransaction, setSendingTransaction] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    logWallet.screenOpened();
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const { walletAPI, paymentAPI } = require('../services/api');

      // Load wallet details (FLOW balance and address)
      try {
        const walletResponse = await walletAPI.getWalletDetails();
        if (walletResponse.success && walletResponse.data) {
          // Format balance to 2 decimal places
          const flowBalance = parseFloat(walletResponse.data.balance || '0').toFixed(2);
          setBalance(flowBalance);
          setWalletAddress(walletResponse.data.address || user?.walletAddress || '');
        } else {
          // Fallback to user wallet address from auth context
          setWalletAddress(user?.walletAddress || '');
        }
      } catch (walletError) {
        console.error('Error loading wallet details:', walletError);
        // Fallback to user wallet address from auth context
        setWalletAddress(user?.walletAddress || '');
      }

      // Load CHT balance
      try {
        const chtResponse = await walletAPI.getCHTBalance();
        if (chtResponse.success && chtResponse.data) {
          // Format CHT balance to 2 decimal places
          const chtBalanceFormatted = parseFloat(chtResponse.data.chtBalance || '0').toFixed(2);
          setChtBalance(chtBalanceFormatted);
        }
      } catch (chtError) {
        console.error('Error loading CHT balance:', chtError);
        // Set to 0 if CHT balance fails to load
        setChtBalance('0.00');
      }

      // Load wallet transactions
      try {
        const txResponse = await walletAPI.getWalletTransactions(50);
        if (txResponse.success && txResponse.data) {
          const walletTransactions = txResponse.data.map(tx => ({
            id: tx.id || tx.transactionId,
            type: tx.type || 'transfer',
            amount: tx.amount,
            flowAmount: tx.flowAmount || tx.amount,
            description: tx.description || 'Flow Transfer',
            date: new Date(tx.timestamp || tx.date).toISOString().split('T')[0],
            status: tx.status || 'completed',
            transactionHash: tx.transactionHash,
            from: tx.from,
            to: tx.to,
          }));
          setTransactions(walletTransactions);
        }
      } catch (txError) {
        console.log('No wallet transactions found, loading payment history instead');
        // Fallback to payment history if wallet transactions fail
        await loadPaymentHistory();
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

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

    // Confirm transaction with user
    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} FLOW tokens to ${recipientAddress.substring(0, 10)}...?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => logWallet.sendCancelled()
        },
        {
          text: 'Send',
          onPress: async () => {
            await executeSendTransaction();
          },
        },
      ]
    );
  };

  const executeSendTransaction = async () => {
    try {
      setSendingTransaction(true);
      const { walletAPI } = require('../services/api');

      const response = await walletAPI.sendFlowTokens(recipientAddress, amount);

      if (response.success) {
        logWallet.sendSuccess(recipientAddress, amount);
        Alert.alert(
          'Success',
          `Transaction sent successfully!\n\nTransaction ID: ${response.data.transactionId?.substring(0, 20)}...`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowSendModal(false);
                setRecipientAddress('');
                setAmount('');
                // Reload wallet data to update balance
                loadWalletData();
              },
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Transaction failed');
      }
    } catch (error) {
      console.error('Error sending tokens:', error);
      logWallet.sendCancelled();
      Alert.alert(
        'Transaction Failed',
        error.response?.data?.message || error.message || 'Failed to send tokens. Please try again.'
      );
    } finally {
      setSendingTransaction(false);
    }
  };

  const copyAddressToClipboard = async () => {
    const addressToCopy = walletAddress || user?.walletAddress || '';
    await Clipboard.setStringAsync(addressToCopy);
    logWallet.addressCopied(addressToCopy);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.content}>
        {/* Wallet Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceHeaderLeft}>
              <Text style={styles.balanceLabel}>Wallet Balance</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Ionicons
                name="refresh"
                size={24}
                color={refreshing ? COLORS.textMuted : COLORS.yellow}
              />
            </TouchableOpacity>
          </View>

          {/* FLOW Balance */}
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{balance} FLOW</Text>
          </View>

          {/* CHT Balance */}
          <View style={styles.chtBalanceRow}>
            <Text style={styles.chtBalanceAmount}>{chtBalance} CHT</Text>
          </View>

          <Text style={styles.walletAddress}>
            {(walletAddress || user?.walletAddress)?.substring(0, 20)}...
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
                placeholder="Amount (FLOW)"
                placeholderTextColor={COLORS.textPlaceholder}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.balanceInfo}>Available: {balance} FLOW</Text>

              <TouchableOpacity
                style={[styles.modalButton, sendingTransaction && styles.modalButtonDisabled]}
                onPress={handleSend}
                disabled={sendingTransaction}
              >
                <Text style={styles.modalButtonText}>
                  {sendingTransaction ? 'Sending...' : 'Send'}
                </Text>
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
                  value={walletAddress || user?.walletAddress || 'No wallet address'}
                  size={200}
                />
              </View>

              <Text style={styles.addressLabel}>Your Wallet Address:</Text>
              <Text style={styles.addressText}>{walletAddress || user?.walletAddress}</Text>

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
                        {transaction.type === 'received' ? '+' : '-'}
                        {transaction.flowAmount ? transaction.flowAmount.toFixed(2) : transaction.amount} FLOW
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
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.sm,
  },
  balanceHeaderLeft: {
    flex: 1,
    alignItems: 'center',
  },
  refreshButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.cardBackground,
  },
  balanceLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.base,
  },
  balanceRow: {
    marginBottom: SPACING.sm,
  },
  balanceAmount: {
    color: COLORS.yellow,
    fontSize: 42,
    fontWeight: 'bold',
  },
  chtBalanceRow: {
    marginBottom: SPACING.md,
  },
  chtBalanceAmount: {
    color: COLORS.success,
    fontSize: 32,
    fontWeight: 'bold',
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
  modalButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.6,
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
