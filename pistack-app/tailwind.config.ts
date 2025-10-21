import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        dark: {
          bg: '#0F1115',
          surface: '#151821',
          card: '#0A0B0E',
          text: '#E6E9F2',
        },
        // Light mode colors
        light: {
          bg: '#FFFFFF',
          surface: '#F9FAFB',
          card: '#F3F4F6',
          text: '#0F1115',
        },
        // Stage colors (fixed for both themes)
        stage: {
          1: '#7AA2FF',
          2: '#5AD19A',
          3: '#FFC24B',
          4: '#FF6B6B',
          5: '#9B8AFB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
