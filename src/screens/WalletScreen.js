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
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { logWallet } from '../utils/analytics';

export default function WalletScreen() {
  const { user } = useAuth();
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    logWallet.screenOpened();
  }, []);

  // Mock balance - in a real app, this would come from blockchain
  const balance = '150.00';

  // Mock transactions - in a real app, this would come from blockchain
  const transactions = [
    {
      id: '1',
      type: 'received',
      amount: '50.00',
      from: '0x1234...5678',
      date: '2025-10-20',
      status: 'completed',
    },
    {
      id: '2',
      type: 'sent',
      amount: '20.00',
      to: '0xabcd...efgh',
      date: '2025-10-19',
      status: 'completed',
    },
    {
      id: '3',
      type: 'payment',
      amount: '15.00',
      description: 'Parking Session',
      date: '2025-10-18',
      status: 'completed',
    },
  ];

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
            <Text style={styles.actionButtonIcon}>↑</Text>
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              logWallet.receiveModalOpened();
              setShowReceiveModal(true);
            }}
          >
            <Text style={styles.actionButtonIcon}>↓</Text>
            <Text style={styles.actionButtonText}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              logWallet.transactionsViewed();
              setShowTransactionsModal(true);
            }}
          >
            <Text style={styles.actionButtonIcon}>≡</Text>
            <Text style={styles.actionButtonText}>Transactions</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions Preview */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {transactions.slice(0, 3).map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionType}>
                  {transaction.type === 'received' && '↓ Received'}
                  {transaction.type === 'sent' && '↑ Sent'}
                  {transaction.type === 'payment' && '💳 Payment'}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.type === 'received' ? styles.amountPositive : styles.amountNegative
              ]}>
                {transaction.type === 'received' ? '+' : '-'}{transaction.amount} CHV
              </Text>
            </View>
          ))}
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
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Amount (CHV)"
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
                        {transaction.type === 'received' && '↓ Received'}
                        {transaction.type === 'sent' && '↑ Sent'}
                        {transaction.type === 'payment' && '💳 Payment'}
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#2196F3',
    padding: 30,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  walletAddress: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 6,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  recentSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountPositive: {
    color: '#4CAF50',
  },
  amountNegative: {
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  balanceInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionsList: {
    maxHeight: 400,
  },
  transactionDetailItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionTypeDetail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionAmountDetail: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transactionDateDetail: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 12,
    color: '#4CAF50',
    textTransform: 'capitalize',
  },
});
