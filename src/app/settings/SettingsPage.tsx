import { Card } from '../../components/ui/Card';
import { ThemeToggle } from '../../components/settings/ThemeToggle';

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Settings</h1>

      <Card>
        <h2 className="mb-4 text-lg font-medium text-text-primary">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Theme</p>
            <p className="text-xs text-text-muted">Select your preferred color scheme</p>
          </div>
          <ThemeToggle />
        </div>
      </Card>
    </div>
  );
}
