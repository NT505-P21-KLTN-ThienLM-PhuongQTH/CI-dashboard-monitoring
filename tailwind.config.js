/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", 'node_modules/flowbite-react/lib/esm/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      screens: {
        '2xsm': '375px',
        xsm: '425px',
        '3xl': '2000px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
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
        'title-2xl': ['72px', { lineHeight: '90px' }],
        'title-xl': ['60px', { lineHeight: '72px' }],
        'title-lg': ['48px', { lineHeight: '60px' }],
        'title-md': ['36px', { lineHeight: '44px' }],
        'title-sm': ['30px', { lineHeight: '38px' }],
        'theme-xl': ['20px', { lineHeight: '30px' }],
        'theme-sm': ['14px', { lineHeight: '20px' }],
        'theme-xs': ['12px', { lineHeight: '18px' }],
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
        gray: {
          25: '#fcfcfd',
          50: '#f9fafb',
          100: '#f2f4f7',
          200: '#e4e7ec',
          300: '#d0d5dd',
          400: '#98a2b3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1d2939',
          900: '#101828',
          950: '#0c111d',
          dark: '#1a2231',
        },
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
        orange: {
          25: '#fffaf5',
          50: '#fff6ed',
          100: '#ffead5',
          200: '#fddcab',
          300: '#feb273',
          400: '#fd853a',
          500: '#fb6514',
          600: '#ec4a0a',
          700: '#c4320a',
          800: '#9c2a10',
          900: '#7e2410',
          950: '#511c10',
        },
        success: {
          25: '#f6fef9',
          50: '#ecfdf3',
          100: '#d1fadf',
          200: '#a6f4c5',
          300: '#6ce9a6',
          400: '#32d583',
          500: '#12b76a',
          600: '#039855',
          700: '#027a48',
          800: '#05603a',
          900: '#054f31',
          950: '#053321',
        },
        error: {
          25: '#fffbfa',
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fecdca',
          300: '#fda29b',
          400: '#f97066',
          500: '#f04438',
          600: '#d92d20',
          700: '#b42318',
          800: '#912018',
          900: '#7a271a',
          950: '#55160c',
        },
        warning: {
          25: '#fffcf5',
          50: '#fffaeb',
          100: '#fef0c7',
          200: '#fedf89',
          300: '#fec84b',
          400: '#fdb022',
          500: '#f79009',
          600: '#dc6803',
          700: '#b54708',
          800: '#93370d',
          900: '#7a2e0e',
          950: '#4e1d09',
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
        current: 'currentColor',
        transparent: 'transparent',
        white: '#ffffff',
        black: '#101828',
        brand: {
          25: '#f2f7ff',
          50: '#ecf3ff',
          100: '#dde9ff',
          200: '#c2d6ff',
          300: '#9cb9ff',
          400: '#7592ff',
          500: '#465fff',
          600: '#3641f5',
          700: '#2a31d8',
          800: '#252dae',
          900: '#262e89',
          950: '#161950',
        },
        'blue-light': {
          25: '#f5fbff',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#0ba5ec',
          600: '#0086c9',
          700: '#026aa2',
          800: '#065986',
          900: '#0b4a6f',
          950: '#062c41',
        },
        'theme-pink': {
          500: '#ee46bc',
        },
        'theme-purple': {
          500: '#7a5af8',
        },
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
      zIndex: {
        1: 1,
        9: 9,
        99: 99,
        999: 999,
        9999: 9999,
        99999: 99999,
        999999: 999999,
      },
      boxShadow: {
        'theme-md': '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
        'theme-lg': '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        'theme-sm': '0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
        'theme-xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        'theme-xl': '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
        'datepicker': '-5px 0 0 #262d3c, 5px 0 0 #262d3c',
        'focus-ring': '0px 0px 0px 4px rgba(70, 95, 255, 0.12)',
        'slider-navigation': '0px 1px 2px 0px rgba(16, 24, 40, 0.1), 0px 1px 3px 0px rgba(16, 24, 40, 0.1)',
        'tooltip': '0px 4px 6px -2px rgba(16, 24, 40, 0.05), -8px 0px 20px 8px rgba(16, 24, 40, 0.05)',
      },
      dropShadow: {
        '4xl': ['0 35px 35px rgba(0, 0, 0, 0.25)', '0 45px 65px rgba(0, 0, 0, 0.15)'],
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, addUtilities }) {
      // Layer base
      addBase({
        '*, ::after, ::before, ::backdrop, ::file-selector-button': {
          borderColor: 'var(--color-gray-200, currentColor)',
        },
        'button:not(:disabled), [role="button"]:not(:disabled)': {
          cursor: 'pointer',
        },
        body: {
          '@apply relative font-normal font-outfit z-1 bg-gray-50': {},
        },
      });

      // Utilities
      addUtilities({
        '.menu-item': {
          '@apply relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-theme-sm': {},
        },
        '.menu-item-active': {
          '@apply bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400': {},
        },
        '.menu-item-inactive': {
          '@apply text-gray-700 hover:bg-gray-100 group-hover:text-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-300': {},
        },
        '.menu-item-icon': {
          '@apply text-gray-500 group-hover:text-gray-700 dark:text-gray-400': {},
        },
        '.menu-item-icon-active': {
          '@apply text-brand-500 dark:text-brand-400': {},
        },
        '.menu-item-icon-size': {
          '& svg': {
            '@apply size-6': {},
          },
        },
        '.menu-item-icon-inactive': {
          '@apply text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300': {},
        },
        '.menu-item-arrow': {
          '@apply relative': {},
        },
        '.menu-item-arrow-active': {
          '@apply rotate-180 text-brand-500 dark:text-brand-400': {},
        },
        '.menu-item-arrow-inactive': {
          '@apply text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300': {},
        },
        '.menu-dropdown-item': {
          '@apply relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-theme-sm font-medium': {},
        },
        '.menu-dropdown-item-active': {
          '@apply bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400': {},
        },
        '.menu-dropdown-item-inactive': {
          '@apply text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5': {},
        },
        '.menu-dropdown-badge': {
          '@apply block rounded-full px-2.5 py-0.5 text-xs font-medium uppercase text-brand-500 dark:text-brand-400': {},
        },
        '.menu-dropdown-badge-active': {
          '@apply bg-brand-100 dark:bg-brand-500/20': {},
        },
        '.menu-dropdown-badge-inactive': {
          '@apply bg-brand-50 group-hover:bg-brand-100 dark:bg-brand-500/15 dark:group-hover:bg-brand-500/20': {},
        },
        '.no-scrollbar': {
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            '@apply size-1.5': {},
          },
          '&::-webkit-scrollbar-track': {
            '@apply rounded-full': {},
          },
          '&::-webkit-scrollbar-thumb': {
            '@apply bg-gray-200 rounded-full dark:bg-gray-700': {},
          },
          '.dark &::-webkit-scrollbar-thumb': {
            'background-color': '#344054',
          },
        },
      });
    }),
  ],
}