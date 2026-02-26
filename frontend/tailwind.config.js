/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Brand colors - teal to green gradient palette
        brand: {
          50:  '#e6fff9',
          100: '#b3ffe9',
          200: '#80ffd9',
          300: '#4dffc9',
          400: '#00E676',
          500: '#00BFA6',
          600: '#00a896',
          700: '#008f7e',
          800: '#007566',
          900: '#005c4e',
          950: '#003d34',
        },
        // Teal accent
        teal: {
          50:  '#e0faf7',
          100: '#b3f3ec',
          200: '#80ece0',
          300: '#4de5d4',
          400: '#26ddc8',
          500: '#00BFA6',
          600: '#00a896',
          700: '#008f7e',
          800: '#007566',
          900: '#005c4e',
          950: '#003d34',
        },
        // Green accent
        green: {
          50:  '#e8fff0',
          100: '#c3ffd8',
          200: '#9effc0',
          300: '#79ffa8',
          400: '#54ff90',
          500: '#00E676',
          600: '#00cc68',
          700: '#00b35a',
          800: '#00994c',
          900: '#00803e',
          950: '#006630',
        },
        // Dark backgrounds
        dark: {
          50:  '#1a2428',
          100: '#151e22',
          200: '#11181c',
          300: '#0d1316',
          400: '#0a0f11',
          500: '#080c0e',
          600: '#060909',
          700: '#040606',
          800: '#020404',
          900: '#010202',
          950: '#000101',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'brand': '0 0 20px rgba(0, 191, 166, 0.3), 0 0 40px rgba(0, 191, 166, 0.1)',
        'brand-sm': '0 0 10px rgba(0, 191, 166, 0.25)',
        'brand-lg': '0 0 40px rgba(0, 191, 166, 0.4), 0 0 80px rgba(0, 191, 166, 0.15)',
        'green': '0 0 20px rgba(0, 230, 118, 0.3), 0 0 40px rgba(0, 230, 118, 0.1)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 191, 166, 0.15)',
        'inner-brand': 'inset 0 1px 0 rgba(0, 191, 166, 0.1)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #00BFA6 0%, #00E676 100%)',
        'gradient-brand-subtle': 'linear-gradient(135deg, rgba(0, 191, 166, 0.15) 0%, rgba(0, 230, 118, 0.15) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0f11 0%, #080c0e 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(17, 24, 28, 0.9) 0%, rgba(13, 19, 22, 0.9) 100%)',
        'mesh-brand': 'radial-gradient(ellipse at 20% 50%, rgba(0, 191, 166, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0, 230, 118, 0.06) 0%, transparent 50%)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient-shift 4s ease infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 191, 166, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 191, 166, 0.6), 0 0 50px rgba(0, 230, 118, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
};
