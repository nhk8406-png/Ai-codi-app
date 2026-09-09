import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, useColorScheme,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../App';
import { INC, EXP } from './categories';
import { useThemeColors } from './utils';

export default function AddScreen() {
  const { addTxn, year, month } = useData();
  const dark = useColorScheme() === 'dark';
  const T = useThemeColors(dark);

  const now = new Date();
  const defaultDate = `${year}-${String(month).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('housing');
  const [date, setDate] = useState(defaultDate);
  const [memo, setMemo] = useState('');

  const cats = type === 'income' ? INC : EXP;

  const handleTypeSwitch = (t) => {
    setType(t);
    setCat(t === 'income' ? INC[0].id : EXP[0].id);
  };

  const handleSubmit = async () => {
    const rawAmt = amount.replace(/[,\s]/g, '');
    const amt = parseInt(rawAmt, 10);
    if (!amt || amt <= 0) { Alert.alert('금액을 입력해주세요'); return; }
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('날짜 형식 오류', 'YYYY-MM-DD 형식으로 입력해주세요\n예: 2026-09-01');
      return;
    }

    await addTxn({ type, amount: amt, cat, date, memo: memo.trim() });
    setAmount('');
    setMemo('');
    Alert.alert('추가 완료', `${type === 'income' ? '수입' : '지출'} ${amt.toLocaleString('ko-KR')}원이 추가되었습니다.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={[s.header, { backgroundColor: T.surface, borderBottomColor: T.border }]}>
        <Text style={[s.headerTitle, { color: T.text }]}>거래 추가</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

          {/* Type toggle */}
          <Label text="유형" T={T} />
          <View style={[s.typeRow, { marginBottom: 18 }]}>
            {[{ v: 'expense', l: '지출', color: T.expense }, { v: 'income', l: '수입', color: T.income }].map(opt => (
              <TouchableOpacity
                key={opt.v}
                onPress={() => handleTypeSwitch(opt.v)}
                style={[
                  s.typeBtn,
                  { borderColor: T.border, backgroundColor: T.card },
                  type === opt.v && { backgroundColor: opt.color + '22', borderColor: opt.color },
                ]}
              >
                <Text style={[s.typeBtnTxt, { color: T.muted }, type === opt.v && { color: opt.color, fontWeight: '700' }]}>
                  {opt.l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Label text="금액 (원)" T={T} />
          <TextInput
            style={[s.input, { backgroundColor: T.card, borderColor: T.border, color: T.text }, s.amountInput]}
            placeholder="0"
            placeholderTextColor={T.muted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Category */}
          <Label text="카테고리" T={T} style={{ marginTop: 18 }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
            {cats.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCat(c.id)}
                style={[
                  s.catChip,
                  { backgroundColor: T.card, borderColor: T.border },
                  cat === c.id && { backgroundColor: c.color + '22', borderColor: c.color },
                ]}
              >
                <View style={[s.catDot, { backgroundColor: c.color }]} />
                <Text style={[s.catTxt, { color: cat === c.id ? c.color : T.muted }, cat === c.id && { fontWeight: '600' }]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Date */}
          <Label text="날짜" T={T} style={{ marginTop: 18 }} />
          <TextInput
            style={[s.input, { backgroundColor: T.card, borderColor: T.border, color: T.text }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={T.muted}
            value={date}
            onChangeText={setDate}
          />

          {/* Memo */}
          <Label text="메모 (선택)" T={T} style={{ marginTop: 18 }} />
          <TextInput
            style={[s.input, { backgroundColor: T.card, borderColor: T.border, color: T.text }]}
            placeholder="거래 내용을 입력하세요"
            placeholderTextColor={T.muted}
            value={memo}
            onChangeText={setMemo}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          {/* Submit */}
          <TouchableOpacity style={[s.submit, { backgroundColor: T.accent }]} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={s.submitTxt}>추가하기</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Label({ text, T, style }) {
  return (
    <Text style={[{ fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, color: T.muted, marginBottom: 6 }, style]}>
      {text}
    </Text>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 11, borderRadius: 9, borderWidth: 1.5, alignItems: 'center' },
  typeBtnTxt: { fontSize: 15 },
  input: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 4 },
  amountInput: { fontSize: 22, fontWeight: '600', marginBottom: 4 },
  catScroll: { gap: 8, paddingBottom: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 13, paddingVertical: 9,
    borderRadius: 22, borderWidth: 1.5,
  },
  catDot: { width: 7, height: 7, borderRadius: 3.5 },
  catTxt: { fontSize: 13 },
  submit: {
    marginTop: 28, paddingVertical: 15,
    borderRadius: 11, alignItems: 'center',
  },
  submitTxt: { fontSize: 16, fontWeight: '700', color: '#000' },
});
