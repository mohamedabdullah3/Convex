import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#5B5CF6',
          600: '#4A4BE0'
        }
      }
    }
  },
  plugins: []
};

export default config;
