import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        family: {
          blue: '#3b82f6',
          green: '#10b981',
          purple: '#8b5cf6',
          warm: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'ui-sans-serif', 'system-ui'],
      },
      screens: {
        'xs': '320px',
      }
    },
  },
  plugins: [],
};
export default config;