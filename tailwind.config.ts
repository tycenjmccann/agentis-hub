import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-0': '#0a0a12',
        'surface-1': '#12121a',
        'surface-2': '#1a1a25',
        'surface-3': '#222230',
        'surface-4': '#2a2a3a',
        'brand-400': '#38bdf8',
        'brand-500': '#0ea5e9',
        'brand-600': '#0284c7',
        'brand-700': '#0369a1',
        'text-primary': '#f8f9fa',
        'text-secondary': '#d1d5db',
        'text-muted': '#9ca3af',
        'status-running': '#22c55e',
        'status-pending': '#fbbf24',
        'status-error': '#ef4444',
      },
      keyframes: {
        gentleBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        statusPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'gentle-bounce': 'gentleBounce 600ms ease-in-out infinite',
        'fade-in': 'fadeIn 200ms ease forwards',
        'fade-out': 'fadeOut 200ms ease forwards',
        'status-pulse': 'statusPulse 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
