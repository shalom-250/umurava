/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(214, 78%, 28%)',
          50: 'hsl(214, 78%, 96%)',
          100: 'hsl(214, 78%, 90%)',
          200: 'hsl(214, 78%, 80%)',
          500: 'hsl(214, 78%, 50%)',
          600: 'hsl(214, 78%, 38%)',
          700: 'hsl(214, 78%, 28%)',
          800: 'hsl(214, 78%, 20%)',
          900: 'hsl(214, 78%, 14%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        accent: {
          DEFAULT: 'hsl(194, 100%, 42%)',
          50: 'hsl(194, 100%, 95%)',
          100: 'hsl(194, 100%, 87%)',
          500: 'hsl(194, 100%, 42%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        background: 'hsl(210, 20%, 97%)',
        foreground: 'hsl(215, 25%, 12%)',
        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(215, 25%, 12%)',
        },
        muted: {
          DEFAULT: 'hsl(210, 16%, 93%)',
          foreground: 'hsl(215, 15%, 48%)',
        },
        border: 'hsl(214, 20%, 88%)',
        success: {
          DEFAULT: 'hsl(142, 71%, 35%)',
          50: 'hsl(142, 71%, 95%)',
          100: 'hsl(142, 71%, 87%)',
        },
        warning: {
          DEFAULT: 'hsl(32, 95%, 44%)',
          50: 'hsl(32, 95%, 95%)',
          100: 'hsl(32, 95%, 87%)',
        },
        danger: {
          DEFAULT: 'hsl(0, 72%, 51%)',
          50: 'hsl(0, 72%, 96%)',
          100: 'hsl(0, 72%, 90%)',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.625rem',
        sm: '0.375rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.125rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15,76,129,0.06), 0 1px 2px -1px rgba(15,76,129,0.04)',
        elevated: '0 4px 16px -2px rgba(15,76,129,0.10), 0 2px 6px -2px rgba(15,76,129,0.06)',
        modal: '0 20px 60px -10px rgba(15,76,129,0.18), 0 8px 24px -6px rgba(15,76,129,0.10)',
      },
    },
  },
  plugins: [],
};