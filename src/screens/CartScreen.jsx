import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import { saveOrderToLocalDB } from '../database/sqliteService';
import apiClient from '../api/client';

function CartScreen() {
  const { cart, updateQuantity, clearCart, totalAmount } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Kéo làm mới để kiểm tra và đồng bộ lại giỏ hàng
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await AsyncStorage.getItem('@cart_data');
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  const executeCheckout = async () => {
    setSubmitting(true);
    const orderCode = `ORD-${Date.now().toString().slice(-6)}`;
    const orderData = {
      orderCode: orderCode,
      totalAmount: totalAmount,
      createdAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }),
      items: cart,
    };

    try {
      const res = await apiClient.post('/create_order.php', orderData);

      if (res.data && res.data.status === 'success') {
        await saveOrderToLocalDB(orderData);
        await clearCart();

        if (Platform.OS === 'web') {
          window.alert('Thành công: Đơn hàng đã được lưu vào hệ thống máy chủ và lịch sử thiết bị!');
        } else {
          Alert.alert('Thành công', 'Đơn hàng đã được lưu vào hệ thống máy chủ và lịch sử thiết bị!');
        }
      } else {
        const errorMsg = res.data?.message || 'Không thể tạo đơn hàng.';
        Platform.OS === 'web' ? window.alert(`Lỗi: ${errorMsg}`) : Alert.alert('Lỗi đặt hàng', errorMsg);
      }
    } catch (err) {
      await saveOrderToLocalDB(orderData);
      await clearCart();
      const netErrMsg = 'Đã lưu đơn vào thiết bị (Chưa đồng bộ lên máy chủ do lỗi mạng/CORS).';
      Platform.OS === 'web' ? window.alert(netErrMsg) : Alert.alert('Thông báo', netErrMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Giỏ hàng trống! Vui lòng chọn món trước khi đặt.');
      } else {
        Alert.alert('Giỏ hàng trống', 'Vui lòng chọn món trước khi đặt.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const isConfirmed = window.confirm(
        `Xác nhận đơn hàng?\nTổng thanh toán: ${totalAmount.toLocaleString()}đ`
      );
      if (isConfirmed) {
        executeCheckout();
      }
    } else {
      Alert.alert(
        'Xác nhận đơn hàng',
        `Tổng thanh toán: ${totalAmount.toLocaleString()}đ. Bạn có muốn đặt ngay?`,
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Đồng ý', onPress: executeCheckout },
        ]
      );
    }
  };

  const renderCartItem = ({ item }) => {
    const toppingNames = item.toppings?.length > 0
      ? item.toppings.map((t) => t.name).join(', ')
      : 'Không topping';

    return (
      <View style={styles.cartCard}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemOptions}>Size: {item.size?.name ? item.size.name.split(' ')[0] : 'Tiêu chuẩn'}</Text>
          <Text style={styles.itemOptions} numberOfLines={1}>Topping: {toppingNames}</Text>
          <Text style={styles.itemPrice}>{(item.unitPrice * item.quantity).toLocaleString()}đ</Text>
        </View>

        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.customKey, -1)}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.customKey, 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyText}>Giỏ hàng đang trống</Text>
      <Text style={styles.pullHintText}>Kéo xuống để cập nhật</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Xoá hết</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.customKey}
        renderItem={renderCartItem}
        ListEmptyComponent={renderEmptyCart}
        contentContainerStyle={[
          styles.listContainer,
          cart.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0284c7']}
          />
        }
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue}>{totalAmount.toLocaleString()}đ</Text>
          </View>
          <TouchableOpacity 
            style={[styles.checkoutBtn, submitting && { opacity: 0.7 }]} 
            onPress={handleCheckout}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.checkoutText}>Tiến hành đặt hàng</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  clearText: { fontSize: 13, color: '#e11d48', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748b' },
  pullHintText: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  listContainer: { padding: 18 },
  emptyListContainer: { flexGrow: 1, justifyContent: 'center' },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemImage: { width: 64, height: 64, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  itemOptions: { fontSize: 12, color: '#64748b', marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: '700', color: '#0284c7', marginTop: 4 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  qtyText: { fontSize: 14, fontWeight: 'bold', minWidth: 16, textAlign: 'center' },
  footer: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#FFFFFF',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 15, color: '#64748b' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#0284c7' },
  checkoutBtn: { backgroundColor: '#0284c7', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  checkoutText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});

export default CartScreen;