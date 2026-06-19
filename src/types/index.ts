export type TransactionType = 'income' | 'expense';

export type Category =
  | '급여' | '사업수입' | '투자수입' | '기타수입'
  | '식비' | '교통비' | '주거비' | '의료비' | '교육비'
  | '쇼핑' | '문화/여가' | '통신비' | '보험료' | '기타지출';

export type RecurringPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: Category;
  amount: number;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringPeriod?: RecurringPeriod;
  tags: string[];
  createdAt: string;
}

export interface Budget {
  id: string;
  category: Category;
  limit: number;
  month: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit';
}

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  categoryBreakdown: Record<string, number>;
  savingsRate: number;
}

export interface AutoRule {
  id: string;
  keyword: string;
  category: Category;
  type: TransactionType;
  isActive: boolean;
}
