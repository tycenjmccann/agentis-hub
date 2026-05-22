import type { LucideIcon } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';

interface PreferenceItemProps {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  saving: boolean;
  onToggle: () => void;
}

export function PreferenceItem({ icon: Icon, label, description, checked, saving, onToggle }: PreferenceItemProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-3">
        <Icon className="h-5 w-5 text-brand-400" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <ToggleSwitch
        checked={checked}
        onChange={onToggle}
        disabled={saving}
        label={`Toggle ${label.toLowerCase()} notifications`}
      />
    </div>
  );
}
