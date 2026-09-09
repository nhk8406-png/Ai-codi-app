import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, StyleSheet, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../App';
import { getCat } from './categories';
import { fmt, MO, useThemeColors } from './utils';

export default function TransactionsScreen() {
  const { txns, year, month, navMonth, deleteTxn } = useData();
  const dark = useColorScheme() === 'dark';
  const T = useThemeColors(dark);

  const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date));
  const totalInc = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const confirmDelete = (txn) => {
    const cat = getCat(txn.type, txn.cat);
    Alert.alert(
      '삭제',
      `"${txn.memo || cat.name}" 거래를 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => deleteTxn(txn.id) },
      ]
    );
  };

  // Group by date
  const grouped = [];
  let lastDate = null;
  for (const txn of sorted) {
    if (txn.date !== lastDate) {
      grouped.push({ type: 'header', date: txn.date });
      lastDate = txn.date;
    }
    grouped.push({ type: 'item', txn });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: T.surface, borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={() => navMonth(-1)} style={[s.navBtn, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={{ color: T.text, fontSize: 20 }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[s.headerTitle, { color: T.text }]}>{year}년 {MO[month - 1]}</Text>
          <View style={s.headerSubs}>
            <Text style={[s.headerSub, { color: T.income }]}>+{fmt(totalInc)}</Text>
            <Text style={[s.headerSub, { color: T.muted }]}> · </Text>
            <Text style={[s.headerSub, { color: T.expense }]}>-{fmt(totalExp)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navMonth(1)} style={[s.navBtn, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={{ color: T.text, fontSize: 20 }}>›</Text>
        </TouchableOpacity>
      </View>

      {grouped.length === 0 ? (
        <View style={s.empty}>
          <Text style={[s.emptyText, { color: T.muted }]}>거래 내역이 없습니다</Text>
          <Text style={[s.emptyHint, { color: T.muted }]}>하단 + 탭에서 추가해보세요</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 30 }}>
          {grouped.map((row, i) => {
            if (row.type === 'header') {
              const [, , dd] = row.date.split('-');
              return (
                <Text key={row.date + i} style={[s.dateHeader, { color: T.muted }]}>
                  {parseInt(dd, 10)}일
                </Text>
              );
            }
            const { txn } = row;
            const cat = getCat(txn.type, txn.cat);
            const sign = txn.type === 'income' ? '+' : '-';
            const color = txn.type === 'income' ? T.income : T.expense;
            return (
              <TouchableOpacity
                key={txn.id}
                style={[s.txnRow, { backgroundColor: T.surface, borderColor: T.border }]}
                onLongPress={() => confirmDelete(txn)}
                activeOpacity={0.75}
              >
                <View style={[s.pip, { backgroundColor: cat.color }]} />
                <View style={s.txnInfo}>
                  <Text style={[s.txnName, { color: T.text }]} numberOfLines={1}>
                    {txn.memo || cat.name}
                  </Text>
                  <Text style={[s.txnCat, { color: T.muted }]}>{cat.name}</Text>
                </View>
                <Text style={[s.txnAmt, { color }]}>
                  {sign}{txn.amount.toLocaleString('ko-KR')}
                </Text>
              </TouchableOpacity>
            );
          })}
          <Text style={[s.hint, { color: T.muted }]}>길게 누르면 삭제</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, gap: 10,
  },
  navBtn: {
    width: 30, height: 30, borderRadius: 6, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  headerSubs: { flexDirection: 'row', marginTop: 2 },
  headerSub: { fontSize: 12, fontWeight: '600' },
  dateHeader: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 14, marginBottom: 6, marginLeft: 2 },
  txnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 13, borderRadius: 10, borderWidth: 1, marginBottom: 7,
  },
  pip: { width: 8, height: 8, borderRadius: 4 },
  txnInfo: { flex: 1 },
  txnName: { fontSize: 14, fontWeight: '500' },
  txnCat: { fontSize: 12, marginTop: 1 },
  txnAmt: { fontSize: 14, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '500' },
  emptyHint: { fontSize: 13 },
  hint: { textAlign: 'center', fontSize: 11, marginTop: 10, opacity: 0.6 },
});
