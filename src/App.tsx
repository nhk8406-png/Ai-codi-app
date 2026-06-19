import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Automation from './pages/Automation';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';

const PAGES: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  transactions: Transactions,
  budget: Budget,
  reports: Reports,
  automation: Automation,
  accounts: Accounts,
  settings: Settings,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const Page = PAGES[currentPage] || Dashboard;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        <Page />
      </main>
    </div>
  );
}
