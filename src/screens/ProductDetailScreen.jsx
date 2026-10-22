import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { SIZES, TOPPINGS as FALLBACK_TOPPINGS } from '../mockData';
import { useCart } from '../context/CartContext';

function ProductDetailScreen({ route, navigation }) {
  const { product, toppings: passedToppings } = route.params || {};
  const { addToCart } = useCart();

  // Dùng danh sách topping truyền từ MySQL qua HomeScreen, nếu rỗng thì dùng fallback
  const availableToppings =
    passedToppings && passedToppings.length > 0
      ? passedToppings
      : FALLBACK_TOPPINGS;

  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Kéo xuống để reset toàn bộ tùy chọn về ban đầu
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedSize(SIZES[0]);
    setSelectedToppings([]);
    setQuantity(1);
    setTimeout(() => {
      setRefreshing(false);
    }, 400);
  }, []);

  // Xử lý bật/tắt checkbox Topping
  const toggleTopping = (topping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  // Tính đơn giá 1 ly theo size và topping được chọn
  const toppingTotal = selectedToppings.reduce(
    (sum, t) => sum + Number(t.price),
    0
  );
  const unitPrice =
    Number(product.basePrice) + Number(selectedSize.extraPrice) + toppingTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      basePrice: Number(product.basePrice),
      size: selectedSize,
      toppings: selectedToppings,
      unitPrice: unitPrice,
      quantity: quantity,
    });

    const successMessage = `Đã thêm ${quantity}x ${product.name} vào giỏ hàng!`;
    if (Platform.OS === 'web') {
      const goToCart = window.confirm(
        `${successMessage}\n\nBạn có muốn chuyển sang xem giỏ hàng ngay không?`
      );
      if (goToCart) {
        navigation.navigate('MainTabs', { screen: 'CartTab' });
      } else {
        navigation.goBack();
      }
    } else {
      Alert.alert('Thành công', successMessage, [
        { text: 'Tiếp tục xem menu', onPress: () => navigation.goBack() },
        {
          text: 'Xem giỏ hàng',
          onPress: () => navigation.navigate('MainTabs', { screen: 'CartTab' }),
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0284c7']}
          />
        }
      >
        <Image source={{ uri: product.image }} style={styles.productImage} />

        <View style={styles.body}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDesc}>{product.description}</Text>
          <Text style={styles.basePriceText}>
            {Number(product.basePrice).toLocaleString()}đ
          </Text>

          {/* 1. CHỌN SIZE */}
          <Text style={styles.sectionTitle}>1. Chọn kích cỡ (Bắt buộc)</Text>
          {SIZES.map((size) => (
            <TouchableOpacity
              key={size.id}
              style={styles.optionRow}
              onPress={() => setSelectedSize(size)}
            >
              <View style={styles.radioOuter}>
                {selectedSize.id === size.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.optionLabel}>{size.name}</Text>
            </TouchableOpacity>
          ))}

          {/* 2. CHỌN TOPPING (ĐỒNG BỘ TỪ MYSQL) */}
          <Text style={styles.sectionTitle}>
            2. Chọn thêm Topping (Dữ liệu CSDL)
          </Text>
          {availableToppings.map((topping) => {
            const isChecked = selectedToppings.some((t) => t.id === topping.id);
            return (
              <TouchableOpacity
                key={topping.id.toString()}
                style={styles.optionRow}
                onPress={() => toggleTopping(topping)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && styles.checkboxChecked,
                  ]}
                >
                  {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.optionLabel}>
                  {topping.name} (+{Number(topping.price).toLocaleString()}đ)
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* 3. CHỌN SỐ LƯỢNG */}
          <Text style={styles.sectionTitle}>3. Số lượng</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => q + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* FOOTER BAR */}
      <View style={styles.footerBar}>
        <View>
          <Text style={styles.footerLabel}>Tổng cộng:</Text>
          <Text style={styles.footerPrice}>{totalPrice.toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  productImage: { width: '100%', height: 260 },
  body: { padding: 18 },
  productName: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  productDesc: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  basePriceText: { fontSize: 18, fontWeight: '700', color: '#0284c7', marginTop: 8 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 22,
    marginBottom: 10,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#0284c7' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: '#0284c7' },
  checkmark: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  optionLabel: { fontSize: 14, color: '#334155' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  qtyBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  quantityValue: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 20 },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: { fontSize: 12, color: '#64748b' },
  footerPrice: { fontSize: 18, fontWeight: 'bold', color: '#0284c7' },
  addCartBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  addCartText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});

export default ProductDetailScreen;