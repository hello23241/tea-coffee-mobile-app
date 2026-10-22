import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';

function AboutScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  const TECH_STACK = [
    { name: 'React Native & Expo', role: 'Mobile Framework đa nền tảng' },
    { name: 'React Navigation', role: 'Stack & Bottom Tabs Navigator' },
    { name: 'React Context API', role: 'Quản lý state Giỏ hàng toàn cục' },
    { name: 'AsyncStorage', role: 'Lưu cache trạng thái phiên & Giỏ hàng' },
    { name: 'SQLite (expo-sqlite)', role: 'Lưu trữ CSDL lịch sử đơn hàng offline' },
    { name: 'PHP REST API & MySQL', role: 'Máy chủ backend trên XAMPP localhost' },
  ];

  const FEATURES = [
    'Xem danh mục & danh sách thức uống từ CSDL XAMPP',
    'Tùy biến kích cỡ ly (Radio button: S, M, L)',
    'Tùy chọn topping động theo thời gian thực từ CSDL (Checkbox)',
    'Tăng giảm số lượng và tính tổng tiền động',
    'Quản lý giỏ hàng: thêm món, tăng/giảm số lượng, xóa giỏ',
    'Đồng bộ đơn hàng lên máy chủ MySQL qua REST API',
    'Lưu vết đơn hàng tự động vào bộ nhớ SQLite thiết bị',
    'Hỗ trợ kéo để làm mới (Pull-to-refresh) toàn diện các màn hình',
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#0284c7']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.appTitle}>Trà Sữa & Cà Phê App</Text>
        <Text style={styles.appSub}>Đồ án môn học: Lập trình Mobile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>👥 Nhóm thực hiện (Đề tài 9 - Nhóm 2)</Text>
        <View style={styles.memberRow}>
          <Text style={styles.memberDot}>•</Text>
          <View>
            <Text style={styles.memberName}>Hồ Nhân Kiệt</Text>
            <Text style={styles.memberRole}>Sinh viên thực hiện</Text>
          </View>
        </View>
        <View style={styles.memberRow}>
          <Text style={styles.memberDot}>•</Text>
          <View>
            <Text style={styles.memberName}>Phạm Ngọc Duy</Text>
            <Text style={styles.memberRole}>Sinh viên thực hiện</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>📋 Đề tài được giao</Text>
        <Text style={styles.topicText}>
          App đặt trà sữa/cà phê — lựa chọn đồ uống, size, topping, số lượng, giỏ hàng và lịch sử đơn hàng.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>⚙️ Công nghệ & Kỹ thuật sử dụng</Text>
        {TECH_STACK.map((tech, idx) => (
          <View key={idx} style={styles.techItem}>
            <Text style={styles.techName}>{tech.name}</Text>
            <Text style={styles.techRole}>{tech.role}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>✅ Tính năng đã hoàn thành</Text>
        {FEATURES.map((feat, idx) => (
          <View key={idx} style={styles.featRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.featText}>{feat}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footerSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  appTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  appSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  memberDot: { fontSize: 18, color: '#0284c7', marginRight: 10, lineHeight: 20 },
  memberName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  memberRole: { fontSize: 12, color: '#64748b', marginTop: 1 },
  topicText: { fontSize: 13, color: '#334155', lineHeight: 20, fontStyle: 'italic' },
  techItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  techName: { fontSize: 13, fontWeight: '700', color: '#0284c7' },
  techRole: { fontSize: 12, color: '#64748b', marginTop: 2 },
  featRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkIcon: { fontSize: 13, fontWeight: 'bold', color: '#16a34a', marginRight: 8 },
  featText: { fontSize: 13, color: '#334155', flex: 1 },
  footerSpacing: { height: 30 },
});

export default AboutScreen;