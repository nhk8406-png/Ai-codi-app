export const MO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

export function fmt(n) {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 100000000) return s + '₩' + (a / 100000000).toFixed(1) + '억';
  if (a >= 10000) return s + '₩' + Math.round(a / 10000) + '만';
  return s + '₩' + a.toLocaleString('ko-KR');
}

export function short(n) {
  const a = Math.abs(n);
  if (a >= 100000000) return (a / 100000000).toFixed(1) + '억';
  if (a >= 10000) return Math.round(a / 10000) + '만';
  return a.toLocaleString('ko-KR');
}

export function useThemeColors(dark) {
  return {
    bg:      dark ? '#08101E' : '#EEF3FA',
    surface: dark ? '#0F1C32' : '#FFFFFF',
    card:    dark ? '#162641' : '#F5F8FE',
    border:  dark ? '#1C3050' : '#D8E4F2',
    text:    dark ? '#ECF0F8' : '#0A1628',
    muted:   dark ? '#6B84A3' : '#5A738D',
    accent:  '#F0A030',
    income:  '#2ECC9A',
    expense: '#F87171',
  };
}
