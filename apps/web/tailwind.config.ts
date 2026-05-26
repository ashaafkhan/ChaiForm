import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        chai: {
          orange: '#f97316',
          'orange-light': '#fb923c',
          'orange-dark': '#ea580c',
          amber: '#f59e0b',
        },
        dark: {
          base: '#0a0a0f',
          surface: '#111118',
          card: '#16161f',
          elevated: '#1e1e2a',
          overlay: '#252535',
        },
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.06)',
        default: 'rgba(255,255,255,0.10)',
        strong: 'rgba(255,255,255,0.20)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #f97316, #f59e0b)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)',
        'gradient-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.12), transparent)',
        'gradient-card': 'linear-gradient(135deg, rgba(249,115,22,0.05), rgba(245,158,11,0.03))',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow: '0 0 40px rgba(249,115,22,0.15)',
        'glow-lg': '0 0 80px rgba(249,115,22,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'fade-in-up': 'fadeInUp 0.5s ease forwards',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(249, 115, 22, 0.4)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
