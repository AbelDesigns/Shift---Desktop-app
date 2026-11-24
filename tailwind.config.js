/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        showcase: '#030304',
        canvas: '#060607',
        surface: '#111113',
        elevated: '#1A1A1E',
        shift: {
          red: '#FF2A36',
        },
        ink: {
          primary: '#F5F5F7',
          secondary: '#86868B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderColor: {
        hairline: 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
};
