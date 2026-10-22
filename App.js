import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CartProvider, useCart } from './src/context/CartContext';
import { initDatabase } from './src/database/sqliteService';

import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import AboutScreen from './src/screens/AboutScreen'; // Import màn hình thông tin

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { totalItemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'Giỏ hàng',
          tabBarBadge: totalItemCount > 0 ? totalItemCount : undefined,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={OrderHistoryScreen}
        options={{
          tabBarLabel: 'Lịch sử',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="AboutTab"
        component={AboutScreen}
        options={{
          tabBarLabel: 'Thông tin',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>ℹ️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{ title: 'Tùy chọn đồ uống' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});