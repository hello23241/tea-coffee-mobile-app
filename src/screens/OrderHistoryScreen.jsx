import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getLocalOrderHistory } from '../database/sqliteService';

function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await getLocalOrderHistory();
      setOrders(data);
    } catch (error) {
      console.error('Lỗi load đơn hàng:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.7}
      onPress={() => setSelectedOrder(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderCode}>{item.order_code}</Text>
        <Text style={styles.orderTime}>{item.created_at}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.itemsText} numberOfLines={2}>{item.items_summary}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.statusBadge}>✓ Thành công (Chi tiết ›)</Text>
        <Text style={styles.totalPrice}>
          {Number(item.total_amount).toLocaleString()}đ
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>Chưa có đơn hàng nào được ghi nhận</Text>
      <Text style={styles.pullHintText}>Kéo xuống để tải lại</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử đặt món</Text>
        <Text style={styles.headerSubtitle}>
          Dữ liệu lưu offline tại thiết bị (SQLite / Storage)
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#0284c7" />
          <Text style={styles.loadingText}>Đang tải lịch sử đơn...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={[
            styles.listContent,
            orders.length === 0 && styles.emptyListContent,
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
      )}

      {/* MODAL XEM CHI TIẾT ĐƠN HÀNG */}
      <Modal
        visible={!!selectedOrder}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <View style={styles.modalBody}>
                <Text style={styles.modalOrderCode}>Mã đơn: {selectedOrder.order_code}</Text>
                <Text style={styles.modalOrderTime}>Thời gian: {selectedOrder.created_at}</Text>
                <View style={styles.modalDivider} />
                <Text style={styles.modalSectionLabel}>Danh sách món đã đặt:</Text>
                <View style={styles.modalItemsBox}>
                  <Text style={styles.modalItemsContent}>{selectedOrder.items_summary}</Text>
                </View>
                <View style={styles.modalTotalRow}>
                  <Text style={styles.modalTotalLabel}>Tổng thanh toán:</Text>
                  <Text style={styles.modalTotalVal}>
                    {Number(selectedOrder.total_amount).toLocaleString()}đ
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedOrder(null)}
            >
              <Text style={styles.modalCloseButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 13, color: '#64748b' },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748b' },
  pullHintText: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  listContent: { padding: 18, gap: 14 },
  emptyListContent: { flexGrow: 1, justifyContent: 'center' },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  orderCode: { fontSize: 14, fontWeight: 'bold', color: '#0284c7' },
  orderTime: { fontSize: 12, color: '#94a3b8' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  itemsText: { fontSize: 13, color: '#334155', lineHeight: 20 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  statusBadge: {
    fontSize: 12,
    color: '#16a34a',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
  },
  totalPrice: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  closeBtn: { fontSize: 18, color: '#64748b', padding: 4 },
  modalBody: { marginTop: 14 },
  modalOrderCode: { fontSize: 14, fontWeight: '700', color: '#0284c7' },
  modalOrderTime: { fontSize: 12, color: '#64748b', marginTop: 2 },
  modalDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  modalSectionLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  modalItemsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalItemsContent: { fontSize: 13, color: '#1e293b', lineHeight: 20 },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  modalTotalLabel: { fontSize: 14, color: '#64748b' },
  modalTotalVal: { fontSize: 18, fontWeight: 'bold', color: '#0284c7' },
  modalCloseButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

export default OrderHistoryScreen;