import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calixo brand colors - Nuevo esquema
        primary: {
          DEFAULT: '#fe4b5b',
          light: '#ff6b7a',
          dark: '#e63946',
          lighter: '#ff8a95',
          darker: '#cc2e3a',
        },
        // Colores complementarios al rojo/rosa principal
        complementary: {
          emerald: {
            DEFAULT: '#10B981',
            light: '#34D399',
            dark: '#059669',
          },
          turquoise: {
            DEFAULT: '#06B6D4',
            light: '#22D3EE',
            dark: '#0891B2',
          },
          mint: {
            DEFAULT: '#A7F3D0',
            light: '#D1FAE5',
            dark: '#6EE7B7',
          },
        },
        // Grises neutros para texto y bordes
        neutral: {
          DEFAULT: '#6B7280',
          light: '#9CA3AF',
          dark: '#4B5563',
          lighter: '#D1D5DB',
          darker: '#374151',
        },
        // Colores de acento
        accent: {
          green: {
            DEFAULT: '#10B981',
            light: '#34D399',
            dark: '#059669',
          },
          red: {
            DEFAULT: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
          },
          yellow: {
            DEFAULT: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
          },
        },
        // Texto oscuro
        text: {
          DEFAULT: '#1F2937',
          light: '#6B7280',
          dark: '#111827',
        },
      },
      fontFamily: {
        sans: ['Questrial', 'system-ui', 'sans-serif'],
        serif: ['Trebuchet MS', 'Trebuchet', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;

