/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/shared-ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Neon Botanic — canonical palette (kept in sync with engine/theme.ts)
        void: '#0a0f1e',
        ink: { 50: '#f8fafc', 100: '#cbd5e1', 300: '#8898b8', 900: '#0f1729', 950: '#0a0f1e' },
        plum: '#1e1733',
        slate: { DEFAULT: '#2f3a52', lit: '#3d4a66' },
        plate: { DEFAULT: '#5b6a8c', glow: '#7587a8' },
        sun: '#ffb86b',
        amber: '#f5a25b',
        cream: '#ffeacc',
        cyan: '#7fdfff',
        magenta: '#ff7fbf',
        moss: '#4a8b6f',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(8, 10, 22, 0.45)',
        'glass-sm': '0 4px 16px 0 rgba(8, 10, 22, 0.35)',
        glow: '0 0 24px -4px rgba(255, 184, 107, 0.4)',
      },
      backdropBlur: { card: '16px' },
      animation: {
        'fade-in': 'fadeIn 280ms ease-out both',
        'slide-up': 'slideUp 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: { '0%, 100%': { opacity: '0.85' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
