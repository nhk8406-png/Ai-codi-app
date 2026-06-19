import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Budget, Account, AutoRule, Category, TransactionType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface AccountingState {
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  autoRules: AutoRule[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addAccount: (a: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, a: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addAutoRule: (r: Omit<AutoRule, 'id'>) => void;
  toggleAutoRule: (id: string) => void;
  deleteAutoRule: (id: string) => void;
  applyAutoRules: (description: string) => { category: Category; type: TransactionType } | null;
  generateRecurring: () => void;
}

const defaultAccounts: Account[] = [
  { id: uuidv4(), name: '주거래 통장', balance: 2500000, type: 'checking' },
  { id: uuidv4(), name: '저축 계좌', balance: 10000000, type: 'savings' },
];

const defaultAutoRules: AutoRule[] = [
  { id: uuidv4(), keyword: '스타벅스', category: '식비', type: 'expense', isActive: true },
  { id: uuidv4(), keyword: '지하철', category: '교통비', type: 'expense', isActive: true },
  { id: uuidv4(), keyword: '버스', category: '교통비', type: 'expense', isActive: true },
  { id: uuidv4(), keyword: '급여', category: '급여', type: 'income', isActive: true },
  { id: uuidv4(), keyword: '임대료', category: '주거비', type: 'expense', isActive: true },
  { id: uuidv4(), keyword: '넷플릭스', category: '문화/여가', type: 'expense', isActive: true },
];

const sampleTransactions: Transaction[] = [
  {
    id: uuidv4(), type: 'income', category: '급여', amount: 3500000,
    description: '5월 급여', date: '2026-05-25', isRecurring: true,
    recurringPeriod: 'monthly', tags: ['급여'], createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(), type: 'expense', category: '식비', amount: 45000,
    description: '스타벅스 커피', date: '2026-06-01', isRecurring: false,
    tags: ['카페'], createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(), type: 'expense', category: '교통비', amount: 52000,
    description: '지하철 교통카드 충전', date: '2026-06-03', isRecurring: false,
    tags: ['교통'], createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(), type: 'expense', category: '주거비', amount: 800000,
    description: '6월 월세', date: '2026-06-05', isRecurring: true,
    recurringPeriod: 'monthly', tags: ['주거'], createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(), type: 'income', category: '급여', amount: 3500000,
    description: '6월 급여', date: '2026-06-25', isRecurring: true,
    recurringPeriod: 'monthly', tags: ['급여'], createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(), type: 'expense', category: '문화/여가', amount: 17000,
    description: '넷플릭스 구독', date: '2026-06-10', isRecurring: true,
    recurringPeriod: 'monthly', tags: ['구독'], createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(), type: 'expense', category: '쇼핑', amount: 128000,
    description: '의류 구매', date: '2026-06-12', isRecurring: false,
    tags: ['쇼핑'], createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(), type: 'expense', category: '식비', amount: 35000,
    description: '점심 식사', date: '2026-06-14', isRecurring: false,
    tags: ['식사'], createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(), type: 'income', category: '투자수입', amount: 150000,
    description: '주식 배당금', date: '2026-06-15', isRecurring: false,
    tags: ['투자'], createdAt: new Date().toISOString(),
  },
];

const sampleBudgets: Budget[] = [
  { id: uuidv4(), category: '식비', limit: 400000, month: '2026-06' },
  { id: uuidv4(), category: '교통비', limit: 100000, month: '2026-06' },
  { id: uuidv4(), category: '쇼핑', limit: 200000, month: '2026-06' },
  { id: uuidv4(), category: '문화/여가', limit: 100000, month: '2026-06' },
];

export const useAccountingStore = create<AccountingState>()(
  persist(
    (set, get) => ({
      transactions: sampleTransactions,
      budgets: sampleBudgets,
      accounts: defaultAccounts,
      autoRules: defaultAutoRules,

      addTransaction: (t) => {
        const newT: Transaction = { ...t, id: uuidv4(), createdAt: new Date().toISOString() };
        set((state) => ({ transactions: [newT, ...state.transactions] }));
      },

      updateTransaction: (id, t) =>
        set((state) => ({
          transactions: state.transactions.map((tx) => (tx.id === id ? { ...tx, ...t } : tx)),
        })),

      deleteTransaction: (id) =>
        set((state) => ({ transactions: state.transactions.filter((tx) => tx.id !== id) })),

      addBudget: (b) =>
        set((state) => ({ budgets: [...state.budgets, { ...b, id: uuidv4() }] })),

      updateBudget: (id, b) =>
        set((state) => ({
          budgets: state.budgets.map((bgt) => (bgt.id === id ? { ...bgt, ...b } : bgt)),
        })),

      deleteBudget: (id) =>
        set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),

      addAccount: (a) =>
        set((state) => ({ accounts: [...state.accounts, { ...a, id: uuidv4() }] })),

      updateAccount: (id, a) =>
        set((state) => ({
          accounts: state.accounts.map((acc) => (acc.id === id ? { ...acc, ...a } : acc)),
        })),

      deleteAccount: (id) =>
        set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) })),

      addAutoRule: (r) =>
        set((state) => ({ autoRules: [...state.autoRules, { ...r, id: uuidv4() }] })),

      toggleAutoRule: (id) =>
        set((state) => ({
          autoRules: state.autoRules.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
          ),
        })),

      deleteAutoRule: (id) =>
        set((state) => ({ autoRules: state.autoRules.filter((r) => r.id !== id) })),

      applyAutoRules: (description) => {
        const { autoRules } = get();
        const matched = autoRules.find(
          (r) => r.isActive && description.toLowerCase().includes(r.keyword.toLowerCase())
        );
        if (matched) return { category: matched.category, type: matched.type };
        return null;
      },

      generateRecurring: () => {
        const { transactions } = get();
        const today = format(new Date(), 'yyyy-MM-dd');
        const currentMonth = format(new Date(), 'yyyy-MM');

        const recurringTx = transactions.filter((t) => t.isRecurring && t.recurringPeriod === 'monthly');

        recurringTx.forEach((t) => {
          const txMonth = t.date.substring(0, 7);
          if (txMonth < currentMonth) {
            const alreadyExists = transactions.some(
              (tx) =>
                tx.description === t.description &&
                tx.date.substring(0, 7) === currentMonth
            );
            if (!alreadyExists) {
              const dayOfMonth = t.date.substring(8, 10);
              const newDate = `${currentMonth}-${dayOfMonth}`;
              const finalDate = newDate <= today ? newDate : today;
              const { id: _id, createdAt: _ca, ...rest } = t;
              get().addTransaction({ ...rest, date: finalDate });
            }
          }
        });
      },
    }),
    {
      name: 'accounting-storage',
    }
  )
);
