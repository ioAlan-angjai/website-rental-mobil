import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ═══ Brand Colors (Stitch) ═══ */
      colors: {
        brand: {
          cream: "#F8F2F1",
          light: "#F8F7F6",
          mauve: "#D7CDCC",
          dark: "#1A1A1A",
          muted: "#6B7280",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          elevated: "#FFFFFF",
          sunken: "#F3EDEC",
          overlay: "rgba(0,0,0,0.4)",
        },
        warm: {
          50: "#FDF8F7",
          100: "#F8F2F1",
          200: "#F0E6E4",
          300: "#E3DDDC",
          400: "#D7CDCC",
          500: "#BFB3B1",
          600: "#9A8E8C",
          700: "#756A68",
          800: "#504745",
          900: "#2B2322",
        },

        /* Semantic (shadcn compat) */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        success: {
          DEFAULT: "hsl(var(--success, 152 69% 31%))",
          foreground: "hsl(var(--success-foreground, 0 0% 100%))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning, 38 92% 50%))",
          foreground: "hsl(var(--warning-foreground, 0 0% 10%))",
        },
        info: {
          DEFAULT: "hsl(var(--info, 210 40% 50%))",
          foreground: "hsl(var(--info-foreground, 0 0% 100%))",
        },

        /* Legacy compat (admin) */
        "neutral-bg": "#F9FAFB",
        "neutral-border": "#E5E7EB",
        "neutral-text": "#6B7280",
        "neutral-dark": "#111827",
      },

      /* ═══ Border Radius ═══ */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },

      /* ═══ Typography ═══ */
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Manrope", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Manrope", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-display)", "Manrope", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        manrope: ["var(--font-display)", "Manrope", "sans-serif"],
        jakarta: ["var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "800" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        "display-sm": ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "700" }],
        "heading-md": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-sm": ["1.125rem", { lineHeight: "1.45", fontWeight: "600" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.7" }],
        "body-md": ["0.9375rem", { lineHeight: "1.7" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6" }],
        "caption": ["0.75rem", { lineHeight: "1.5", fontWeight: "500" }],
        "overline": ["0.6875rem", { lineHeight: "1.5", letterSpacing: "0.05em", fontWeight: "600" }],
      },

      /* ═══ Spacing ═══ */
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      /* ═══ Box Shadows ═══ */
      boxShadow: {
        "card": "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)",
        "elevated": "0 4px 16px -4px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.04)",
        "modal": "0 20px 60px -12px rgba(0,0,0,0.15), 0 8px 20px -8px rgba(0,0,0,0.08)",
        "button": "0 1px 2px 0 rgba(0,0,0,0.05)",
        "button-hover": "0 2px 4px -1px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "input-focus": "0 0 0 3px rgba(215,205,204,0.4)",
        "inner": "inset 0 1px 2px 0 rgba(0,0,0,0.04)",
      },

      /* ═══ Animations ═══ */
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "spin-slow": "spin 3s linear infinite",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
        "ping-subtle": "pingSutle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blink-alert": "blinkAlert 1s step-end infinite",
        "count-up": "countUp 2s ease-out forwards",
        "underline-slide": "underlineSlide 0.3s ease-out forwards",
        "gradient": "gradient 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        pingSutle: {
          "75%, 100%": { transform: "scale(1.05)", opacity: "0.2" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        blinkAlert: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        countUp: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        underlineSlide: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "0% center" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },

      /* ═══ Transitions ═══ */
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
