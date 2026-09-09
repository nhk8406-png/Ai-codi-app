import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useColorScheme, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../App';
import SankeyChart from './SankeyChart';
import { fmt, short, MO, useThemeColors } from './utils';
import { getCat, EXP } from './categories';

export default function HomeScreen() {
  const { txns, year, month, navMonth } = useData();
  const dark = useColorScheme() === 'dark';
  const T = useThemeColors(dark);
  const { width } = useWindowDimensions();

  const inc = txns.filter(t => t.type === 'income');
  const exp = txns.filter(t => t.type === 'expense');
  const ti = inc.reduce((s, t) => s + t.amount, 0);
  const te = exp.reduce((s, t) => s + t.amount, 0);
  const net = ti - te;
  const rate = ti > 0 ? Math.round(net / ti * 100) : 0;

  // Category breakdown
  const byCat = {};
  exp.forEach(t => byCat[t.cat] = (byCat[t.cat] || 0) + t.amount);
  const breakdown = Object.entries(byCat)
    .map(([id, amount]) => ({ ...getCat('expense', id), amount, pct: te ? Math.round(amount / te * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
  const maxAmt = breakdown[0]?.amount || 1;

  const chartW = width - 48;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: T.surface, borderBottomColor: T.border }]}>
        <View style={[s.logoMark, { backgroundColor: T.accent }]}>
          <Text style={s.logoMarkText}>₩</Text>
        </View>
        <Text style={[s.logoText, { color: T.text }]}>MoneyFlow</Text>
        <View style={s.mnav}>
          <TouchableOpacity onPress={() => navMonth(-1)} style={[s.navBtn, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={{ color: T.text, fontSize: 20 }}>‹</Text>
          </TouchableOpacity>
          <Text style={[s.monthLbl, { color: T.text }]}>{year}년 {MO[month - 1]}</Text>
          <TouchableOpacity onPress={() => navMonth(1)} style={[s.navBtn, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={{ color: T.text, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Stats */}
        <View style={s.statsGrid}>
          <StatCard label="총 수입" value={fmt(ti)} color={T.income} sub={`${inc.length}건`} T={T} />
          <StatCard label="총 지출" value={fmt(te)} color={T.expense} sub={`${exp.length}건`} T={T} />
          <StatCard label="순 흐름" value={(net >= 0 ? '+' : '') + fmt(net)} color={net >= 0 ? T.income : T.expense} sub="수입 − 지출" T={T} />
          <StatCard label="저축률" value={rate + '%'} color={T.accent} sub="수입 대비" T={T} />
        </View>

        {/* Sankey */}
        <View style={[s.panel, { backgroundColor: T.surface, borderColor: T.border }]}>
          <Text style={[s.panelTitle, { color: T.muted }]}>돈의 흐름 시각화</Text>
          <SankeyChart txns={txns} width={chartW} height={280} dark={dark} />
        </View>

        {/* Breakdown */}
        {breakdown.length > 0 && (
          <View style={[s.panel, { backgroundColor: T.surface, borderColor: T.border }]}>
            <Text style={[s.panelTitle, { color: T.muted }]}>카테고리별 지출</Text>
            {breakdown.map(item => (
              <View key={item.id} style={s.bkRow}>
                <View style={s.bkInfo}>
                  <View style={[s.bkDot, { backgroundColor: item.color }]} />
                  <Text style={[s.bkName, { color: T.text }]}>{item.name}</Text>
                </View>
                <View style={s.bkBarWrap}>
                  <View style={[s.bkTrack, { backgroundColor: T.border }]}>
                    <View style={[s.bkFill, { width: `${Math.round(item.amount / maxAmt * 100)}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
                <Text style={[s.bkAmt, { color: T.muted }]}>{item.pct}% · {short(item.amount)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, sub, T }) {
  return (
    <View style={[s.statCard, { backgroundColor: T.surface, borderColor: T.border }]}>
      <Text style={[s.statLabel, { color: T.muted }]}>{label}</Text>
      <Text style={[s.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={[s.statSub, { color: T.muted }]}>{sub}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, gap: 10,
  },
  logoMark: {
    width: 26, height: 26, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  logoMarkText: { fontSize: 12, fontWeight: '700', color: '#000' },
  logoText: { fontSize: 17, fontWeight: '700', flex: 1 },
  mnav: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navBtn: {
    width: 30, height: 30, borderRadius: 6, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  monthLbl: { fontSize: 13, fontWeight: '600', minWidth: 76, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  statCard: {
    width: '47.5%', padding: 14,
    borderRadius: 10, borderWidth: 1,
  },
  statLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  statSub: { fontSize: 11 },
  panel: {
    marginHorizontal: 12, marginBottom: 12,
    borderRadius: 10, borderWidth: 1, padding: 16,
  },
  panelTitle: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  bkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  bkInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 76 },
  bkDot: { width: 7, height: 7, borderRadius: 2 },
  bkName: { fontSize: 12, fontWeight: '500', flex: 1 },
  bkBarWrap: { flex: 1 },
  bkTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  bkFill: { height: '100%', borderRadius: 2 },
  bkAmt: { fontSize: 11, width: 70, textAlign: 'right' },
});
