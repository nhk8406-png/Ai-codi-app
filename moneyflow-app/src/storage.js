import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeSample } from './categories';

const key = (y, m) => `mf_${y}_${String(m).padStart(2, '0')}`;

export async function loadMonth(y, m) {
  try {
    const raw = await AsyncStorage.getItem(key(y, m));
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const now = new Date();
  if (y === now.getFullYear() && m === now.getMonth() + 1) {
    const sample = makeSample(y, m);
    await saveMonth(y, m, sample);
    return sample;
  }
  return [];
}

export async function saveMonth(y, m, txns) {
  try {
    await AsyncStorage.setItem(key(y, m), JSON.stringify(txns));
  } catch (e) {}
}
