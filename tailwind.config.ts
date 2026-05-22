import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-0': '#0a0a0f',
        'surface-1': '#12121a',
        'surface-2': '#1a1a25',
        'surface-3': '#222230',
        'surface-4': '#2a2a3a',
        'brand-400': '#38bdf8',
        'brand-500': '#0ea5e9',
        'brand-600': '#0284c7',
        'text-primary': '#f8f9fa',
        'text-secondary': '#d1d5db',
        'text-muted': '#9ca3af',
        'status-error': '#ef4444',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        slideDown: 'slideDown 200ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
