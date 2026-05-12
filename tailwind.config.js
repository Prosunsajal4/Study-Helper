/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1e40af',
          light: '#3b82f6',
        },
        secondary: '#64748b',
        accent: '#8b5cf6',
        highlight: {
          high: '#fef08a',
          medium: '#bfdbfe',
        },
        background: '#f1f5f9',
        surface: '#ffffff',
        'surface-hover': '#f8fafc',
        text: '#0f172a',
        'text-light': '#64748b',
        'text-muted': '#94a3b8',
        border: '#e2e8f0',
        'border-light': '#f1f5f9',
        success: '#10b981',
        'success-light': '#d1fae5',
        error: '#ef4444',
        'error-light': '#fee2e2',
        warning: '#f59e0b',
        'warning-light': '#fef3c7',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'sm': '8px',
        DEFAULT: '12px',
        'lg': '16px',
      },
    },
  },
  plugins: [],
}