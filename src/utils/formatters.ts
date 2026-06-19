export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);

export const formatNumber = (amount: number): string =>
  new Intl.NumberFormat('ko-KR').format(amount);

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

export const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  return `${year}년 ${parseInt(month)}월`;
};

export const INCOME_CATEGORIES = ['급여', '사업수입', '투자수입', '기타수입'] as const;
export const EXPENSE_CATEGORIES = [
  '식비', '교통비', '주거비', '의료비', '교육비',
  '쇼핑', '문화/여가', '통신비', '보험료', '기타지출'
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  '급여': '#10b981',
  '사업수입': '#3b82f6',
  '투자수입': '#8b5cf6',
  '기타수입': '#06b6d4',
  '식비': '#ef4444',
  '교통비': '#f97316',
  '주거비': '#f59e0b',
  '의료비': '#ec4899',
  '교육비': '#6366f1',
  '쇼핑': '#14b8a6',
  '문화/여가': '#84cc16',
  '통신비': '#64748b',
  '보험료': '#78716c',
  '기타지출': '#94a3b8',
};
