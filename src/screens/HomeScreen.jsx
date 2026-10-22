import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import apiClient from '../api/client';

const CATEGORIES = ['Tất cả', 'Trà sữa', 'Cà phê'];

function HomeScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [products, setProducts] = useState([]);
  const [toppings, setToppings] = useState([]); // State lưu topping từ CSDL
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm tải dữ liệu menu & topping từ XAMPP
  const fetchMenu = async () => {
    try {
      const res = await apiClient.get('/get_menu.php');
      if (res.data && res.data.status === 'success') {
        setProducts(res.data.data.products || []);
        setToppings(res.data.data.toppings || []); // Đồng bộ danh sách topping
      } else {
        Alert.alert('Lỗi', 'Không thể lấy dữ liệu món từ máy chủ.');
      }
    } catch (error) {
      console.error('Lỗi fetchMenu:', error);
      Alert.alert('Lỗi kết nối', 'Vui lòng kiểm tra lại Apache trong XAMPP và địa chỉ IP LAN.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Xử lý kéo xuống để làm mới (Pull-to-refresh)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenu();
  }, []);

  const filteredProducts =
    selectedCategory === 'Tất cả'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      // Truyền cả thông tin món VÀ danh sách toppings động sang màn hình chi tiết
      onPress={() => navigation.navigate('ProductDetail', { product: item, toppings: toppings })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>{Number(item.basePrice).toLocaleString()}đ</Text>
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>Đặt món +</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trà Sữa & Cà Phê</Text>
        <Text style={styles.headerSubtitle}>Dữ liệu trực tiếp từ CSDL MySQL (XAMPP)</Text>
      </View>

      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Đang tải danh sách món...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284c7']} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  categoryRow: { flexDirection: 'row', paddingHorizontal: 18, marginVertical: 12, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9' },
  categoryChipActive: { backgroundColor: '#0284c7' },
  categoryText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748b' },
  listContainer: { paddingHorizontal: 18, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  cardImage: { width: 110, height: 110 },
  cardContent: { flex: 1, padding: 10, justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  cardDesc: { fontSize: 12, color: '#64748b' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 15, fontWeight: 'bold', color: '#0284c7' },
  orderBadge: { backgroundColor: '#f0f9ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  orderBadgeText: { color: '#0284c7', fontSize: 12, fontWeight: '600' },
});

export default HomeScreen;