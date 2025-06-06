import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import tailwindAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        knowledge: {
          primary: "#262626",    // Updated to the provided highlight color
          secondary: "#404040",  // Updated to the provided main text color
          tertiary: "#808080",   // Updated to the provided secondary text color
          dark: "#333333",       // Updated to the provided button hover color
          light: "#F8F8F8",      // Updated to the provided background color
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "10": "10px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        pulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '0.9' }
        },
        glow: {
          '0%, 100%': { opacity: '0.8', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.2)' }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.5em',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.5em',
            },
            strong: {
              fontWeight: '600',
            },
            code: {
              fontWeight: '400',
            },
            img: {
              marginTop: '0',
              marginBottom: '0',
            },
          },
        },
      },
    },
  },
  plugins: [
    tailwindAnimate,
    require('@tailwindcss/typography'),
    function({ addComponents, addUtilities }: any) {
      addComponents({
        '.skeleton-wave-shimmer': {
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)',
          animation: 'shimmer 2s infinite',
          height: '100%',
          width: '50%',
        },
      });
      
      // Add custom utilities
      addUtilities({
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.editor-list-ul': {
          listStyleType: 'disc !important',
          paddingLeft: '1.5em !important',
          marginTop: '0.5em !important',
          marginBottom: '0.5em !important',
        },
        '.editor-list-ol': {
          listStyleType: 'decimal !important',
          paddingLeft: '1.5em !important',
          marginTop: '0.5em !important',
          marginBottom: '0.5em !important',
        },
      });
    },
  ],
} satisfies Config;

export default config;
