/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7f2',
          100: '#ffede3',
          200: '#ffd8c4',
          300: '#ffbc9b',
          400: '#f78d58',
          500: '#eb642e', // Main burnt orange / coral accent (#FF642D compatible)
          600: '#cc4e27', // Deeper orange / hover (#FF7547 compatible)
          700: '#b03d1c',
          800: '#8c3117',
          900: '#722a15',
          950: '#3e1307',
        },
        // Neutral black & charcoal dark theme foundation (no blue/navy tint)
        dark: {
          bg: '#050505',               // Main application outer background
          rail: '#000000',             // Vertical navigation rail
          surface: '#0B0B0B',          // Primary surface / main panels
          card: '#111111',             // Secondary surface / cards & elevated sections
          tertiary: '#181818',         // Tertiary surface / nested panels & inputs
          hover: '#202020',            // Hovered interactive elements
          border: '#292929',           // Card borders and dividers
          'border-strong': '#383838',  // Selected or emphasized outlines
          'text-primary': '#F5F5F5',   // Main headings and values
          'text-secondary': '#B0B0B0', // Body text and labels
          'text-muted': '#808080',     // Secondary metadata
          'accent-soft': '#24140E',    // Subtle warm orange-tinted surfaces
        },
        // Slate mapping to neutralize blue undertones in dark mode
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#808080',
          500: '#666666',
          600: '#4d4d4d',
          700: '#383838', // Strong border
          800: '#181818', // Tertiary surface / input / chip
          850: '#141414',
          900: '#111111', // Card surface
          950: '#0B0B0B', // Primary main panel surface
        },
        canvas: {
          light: '#EAECEF',
          dark: '#050505',
        },
        peach: {
          50: '#FFF9F5',
          100: '#FFF0E8',
          200: '#FFDEC9',
        },
        charcoal: {
          900: '#2E2E2E',
          800: '#3D3D3D',
          600: '#666666',
          500: '#858585',
          400: '#A7A7A7',
        },
        rail: '#000000',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'shell': '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
}
