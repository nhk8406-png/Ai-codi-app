export const INC = [
  { id: 'salary',   name: '급여',     color: '#2ECC9A' },
  { id: 'side',     name: '부업',     color: '#5B8CFF' },
  { id: 'invest',   name: '투자수익', color: '#F0A030' },
  { id: 'rental',   name: '임대수입', color: '#A78BFA' },
  { id: 'bonus',    name: '보너스',   color: '#FB923C' },
  { id: 'other_i',  name: '기타수입', color: '#34D399' },
];

export const EXP = [
  { id: 'housing',       name: '주거비',    color: '#F87171' },
  { id: 'food',          name: '식비',      color: '#FBBF24' },
  { id: 'transport',     name: '교통비',    color: '#60A5FA' },
  { id: 'health',        name: '의료비',    color: '#34D399' },
  { id: 'entertainment', name: '여가/문화', color: '#A78BFA' },
  { id: 'education',     name: '교육비',    color: '#FB923C' },
  { id: 'savings',       name: '저축/투자', color: '#22D3EE' },
  { id: 'clothing',      name: '의류/미용', color: '#F472B6' },
  { id: 'other',         name: '기타',      color: '#94A3B8' },
];

export function getCat(type, id) {
  return (type === 'income' ? INC : EXP).find(c => c.id === id)
      || { id, name: id, color: '#94A3B8' };
}

export function makeSample(Y, M) {
  const d = n => `${Y}-${String(M).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  return [
    { id: 's1',  type: 'income',  cat: 'salary',        amount: 3500000, memo: '월급',         date: d(25) },
    { id: 's2',  type: 'income',  cat: 'side',          amount: 480000,  memo: '프리랜서 작업', date: d(15) },
    { id: 's3',  type: 'income',  cat: 'invest',        amount: 120000,  memo: '배당금',        date: d(10) },
    { id: 's4',  type: 'expense', cat: 'housing',       amount: 750000,  memo: '월세',          date: d(1)  },
    { id: 's5',  type: 'expense', cat: 'food',          amount: 195000,  memo: '식료품',        date: d(8)  },
    { id: 's6',  type: 'expense', cat: 'food',          amount: 88000,   memo: '외식',          date: d(14) },
    { id: 's7',  type: 'expense', cat: 'food',          amount: 65000,   memo: '배달음식',      date: d(21) },
    { id: 's8',  type: 'expense', cat: 'transport',     amount: 132000,  memo: '교통비',        date: d(20) },
    { id: 's9',  type: 'expense', cat: 'health',        amount: 145000,  memo: '병원/약',       date: d(12) },
    { id: 's10', type: 'expense', cat: 'entertainment', amount: 175000,  memo: '영화/여가',     date: d(18) },
    { id: 's11', type: 'expense', cat: 'education',     amount: 320000,  memo: '온라인 강의',   date: d(5)  },
    { id: 's12', type: 'expense', cat: 'savings',       amount: 1200000, memo: '적금',          date: d(25) },
    { id: 's13', type: 'expense', cat: 'clothing',      amount: 89000,   memo: '옷 구매',       date: d(16) },
    { id: 's14', type: 'expense', cat: 'other',         amount: 241000,  memo: '기타',          date: d(28) },
  ];
}
