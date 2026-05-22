interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}

export function ToggleSwitch({ checked, onChange, disabled = false, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
        transition-colors duration-150 motion-reduce:transition-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? 'bg-brand-500' : 'bg-surface-4'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
          transform transition-transform duration-150 motion-reduce:transition-none
          ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}
        `}
      />
    </button>
  );
}
