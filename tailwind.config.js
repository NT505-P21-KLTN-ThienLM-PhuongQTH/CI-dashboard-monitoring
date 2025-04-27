/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", 'node_modules/flowbite-react/lib/esm/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      fontSize: {
        'heading-1': '3.375rem',
        'heading-2': '2.625rem',
        'heading-3': '2rem',
        'heading-4': '1.5rem',
        'heading-5': '1.25rem',
        'heading-6': '1.125rem',
        'body-L': '1.125rem',
        'body-M': '1rem',
        'body-S': '0.875rem',
        'body-XS': '0.75rem',
        'body-XXS': '0.625rem',
        'subtitle-M': '1rem',
        'subtitle-S': '0.875rem',
        caption: '1.125rem',
        menu: '1rem',
        'button-L': '1.125rem',
        'button-M': '1rem',
        'button-S': '0.875rem',
      },
      fontWeight: {
        heading: '700',
        body: '400',
        subtitle: '500',
        caption: '700',
        menu: '500',
        button: '500',
      },
      colors: {
        background: '#F9FAFB', // Light gray background
        primary: '#3B82F6', // Blue for primary actions
        secondary: '#6B7280', // Gray for secondary elements
        'base-color': '#111827', // Dark gray for base text
        'base-outline': '#D1D5DB', // Light gray for outlines
        default: {
          white: '#FFFFFF',
          alert: '#DA1E28',
          warning: '#F1C21B',
          success: '#25A249',
          overlay: '#121619',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2A44',
          900: '#111827',
          950: '#030712',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        'blue-theme': '#1A97F5',
        'green-theme': '#03C9D7',
        'purple-theme': '#7352FF',
        'red-theme': '#FF5C8E',
        'indigo-theme': '#1E4DB7',
        'orange-theme': '#FB9678',
      },
      borderRadius: {
        '0xl': '0.625rem',
      },
      width: {
        20: '5rem',
        25: '6.25rem',
        150: '37.5rem',
        160: '40rem',
        170: '42.5rem',
        180: '45rem',
      },
    },
  },
  plugins: [],
}