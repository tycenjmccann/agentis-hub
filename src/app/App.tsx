import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { SettingsPage } from './settings/SettingsPage';
import { Card } from '../components/ui/Card';

function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Dashboard</h1>
      <Card>
        <p className="text-text-secondary">
          Pipeline visualization for AI agents. Navigate to Settings to configure your theme.
        </p>
      </Card>
    </div>
  );
}

export function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="flex h-screen bg-surface-0">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
