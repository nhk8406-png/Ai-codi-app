import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { loadMonth, saveMonth } from './src/storage';
import HomeScreen from './src/HomeScreen';
import TransactionsScreen from './src/TransactionsScreen';
import AddScreen from './src/AddScreen';

const Tab = createBottomTabNavigator();
const DataContext = createContext(null);

export function useData() { return useContext(DataContext); }

const TAB_ICONS = { '홈': '◎', '거래내역': '≡', '추가': '+' };

export default function App() {
  const dark = useColorScheme() === 'dark';

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [txns, setTxns] = useState([]);

  const reload = useCallback(async (y, m) => {
    const data = await loadMonth(y, m);
    setTxns(data);
  }, []);

  useEffect(() => { reload(year, month); }, [year, month]);

  const addTxn = useCallback(async (txn) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const updated = [...txns, { ...txn, id }];
    setTxns(updated);
    await saveMonth(year, month, updated);
  }, [txns, year, month]);

  const deleteTxn = useCallback(async (id) => {
    const updated = txns.filter(t => t.id !== id);
    setTxns(updated);
    await saveMonth(year, month, updated);
  }, [txns, year, month]);

  const navMonth = useCallback((dir) => {
    let m = month + dir, y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setYear(y);
    setMonth(m);
  }, [year, month]);

  const navTheme = {
    dark,
    colors: {
      primary: '#F0A030',
      background: dark ? '#08101E' : '#EEF3FA',
      card: dark ? '#0F1C32' : '#FFFFFF',
      text: dark ? '#ECF0F8' : '#0A1628',
      border: dark ? '#1C3050' : '#D8E4F2',
      notification: '#F0A030',
    },
  };

  return (
    <SafeAreaProvider>
      <DataContext.Provider value={{ txns, year, month, addTxn, deleteTxn, navMonth }}>
        <NavigationContainer theme={navTheme}>
          <StatusBar style={dark ? 'light' : 'dark'} />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <View style={{ alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                  <Text style={{
                    fontSize: route.name === '추가' ? 24 : 18,
                    color,
                    fontWeight: focused ? '700' : '400',
                  }}>
                    {TAB_ICONS[route.name]}
                  </Text>
                </View>
              ),
              tabBarActiveTintColor: '#F0A030',
              tabBarInactiveTintColor: dark ? '#6B84A3' : '#5A738D',
              tabBarStyle: {
                backgroundColor: dark ? '#0F1C32' : '#FFFFFF',
                borderTopColor: dark ? '#1C3050' : '#D8E4F2',
                paddingTop: 4,
              },
              tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
            })}
          >
            <Tab.Screen name="홈" component={HomeScreen} />
            <Tab.Screen name="거래내역" component={TransactionsScreen} />
            <Tab.Screen name="추가" component={AddScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </DataContext.Provider>
    </SafeAreaProvider>
  );
}
