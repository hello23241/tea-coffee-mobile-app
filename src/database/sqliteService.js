import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let SQLite = null;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

let db = null;
const WEB_ORDER_KEY = '@web_order_history_fallback';

// Khởi tạo Database
export const initDatabase = async () => {
  if (Platform.OS === 'web') return;

  try {
    db = await SQLite.openDatabaseAsync('teacoffee_app.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS order_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_code TEXT NOT NULL,
        created_at TEXT NOT NULL,
        total_amount REAL NOT NULL,
        items_summary TEXT NOT NULL
      );
    `);
  } catch (error) {
    console.error('Lỗi khởi tạo SQLite:', error);
  }
};

// Lưu đơn hàng
export const saveOrderToLocalDB = async (order) => {
  const itemsSummary = order.items
    .map(
      (i) =>
        `${i.quantity}x ${i.name} (${i.size.id}${
          i.toppings?.length ? ', ' + i.toppings.map((t) => t.name).join('+') : ''
        })`
    )
    .join('\n');

  // Nếu đang test trên Web -> Lưu tạm vào AsyncStorage
  if (Platform.OS === 'web') {
    try {
      const prevData = await AsyncStorage.getItem(WEB_ORDER_KEY);
      const orders = prevData ? JSON.parse(prevData) : [];
      const newEntry = {
        id: Date.now(),
        order_code: order.orderCode,
        created_at: order.createdAt,
        total_amount: order.totalAmount,
        items_summary: itemsSummary,
      };
      await AsyncStorage.setItem(WEB_ORDER_KEY, JSON.stringify([newEntry, ...orders]));
    } catch (err) {
      console.error('Lỗi lưu đơn trên web:', err);
    }
    return;
  }

  // Nếu chạy trên Android/iOS -> Chạy SQLite thuần
  try {
    if (!db) db = await SQLite.openDatabaseAsync('teacoffee_app.db');
    await db.runAsync(
      'INSERT INTO order_history (order_code, created_at, total_amount, items_summary) VALUES (?, ?, ?, ?)',
      [order.orderCode, order.createdAt, order.totalAmount, itemsSummary]
    );
  } catch (error) {
    console.error('Lỗi lưu đơn hàng vào SQLite:', error);
  }
};

// Lấy danh sách lịch sử đơn hàng
export const getLocalOrderHistory = async () => {
  // Đọc từ AsyncStorage nếu là Web
  if (Platform.OS === 'web') {
    try {
      const res = await AsyncStorage.getItem(WEB_ORDER_KEY);
      return res ? JSON.parse(res) : [];
    } catch (err) {
      return [];
    }
  }

  // Đọc từ SQLite nếu là thiết bị di động
  try {
    if (!db) db = await SQLite.openDatabaseAsync('teacoffee_app.db');
    const rows = await db.getAllAsync(
      'SELECT * FROM order_history ORDER BY id DESC'
    );
    return rows;
  } catch (error) {
    console.error('Lỗi đọc đơn từ SQLite:', error);
    return [];
  }
};