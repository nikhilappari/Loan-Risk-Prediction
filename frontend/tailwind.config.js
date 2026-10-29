/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        app: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          borderLight: '#F1F5F9',
          text: '#0F172A',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          border: '#BFDBFE',
        },
        status: {
          success: '#16A34A',
          successBg: '#F0FDF4',
          successBorder: '#BBF7D0',
          warning: '#D97706',
          warningBg: '#FFFBEB',
          warningBorder: '#FDE68A',
          danger: '#DC2626',
          dangerBg: '#FEF2F2',
          dangerBorder: '#FECACA',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
