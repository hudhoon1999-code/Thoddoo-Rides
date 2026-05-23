/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Thoddoo Island palette
        teal: {
          50:  '#f0fffe',
          100: '#ccfbf7',
          200: '#99f5ef',
          300: '#5de9e2',
          400: '#2dd4cb',
          500: '#1CC7C1',  // primary
          600: '#0f9e9a',
          700: '#0e7490',  // deep ocean
          800: '#115e6b',
          900: '#134e55',
        },
        coral: {
          400: '#ff9a7a',
          500: '#FF7A59',  // coral sunset
          600: '#e85e3d',
        },
        sand: {
          50:  '#fffef8',
          100: '#F8F4EC',  // warm sand
          200: '#f0e8d4',
          300: '#e4d5b4',
        },
        palm: {
          600: '#2F855A',  // palm green
          700: '#276749',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        island: '0 4px 24px rgba(28, 199, 193, 0.15)',
        card:   '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
