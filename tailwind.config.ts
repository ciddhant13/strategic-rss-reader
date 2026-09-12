import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["'Newsreader'", "Georgia", "serif"],
      },
      colors: {
        // Material Design 3 Expressive Tonal Hierarchy
        md: {
          surface: "rgb(var(--md-surface) / <alpha-value>)",
          surfaceDim: "rgb(var(--md-surface-dim) / <alpha-value>)",
          surfaceBright: "rgb(var(--md-surface-bright) / <alpha-value>)",
          surfaceContainerLowest: "rgb(var(--md-surface-container-lowest) / <alpha-value>)",
          surfaceContainerLow: "rgb(var(--md-surface-container-low) / <alpha-value>)",
          surfaceContainer: "rgb(var(--md-surface-container) / <alpha-value>)",
          surfaceContainerHigh: "rgb(var(--md-surface-container-high) / <alpha-value>)",
          surfaceContainerHighest: "rgb(var(--md-surface-container-highest) / <alpha-value>)",
          
          onSurface: "rgb(var(--md-on-surface) / <alpha-value>)",
          onSurfaceVariant: "rgb(var(--md-on-surface-variant) / <alpha-value>)",
          outline: "rgb(var(--md-outline) / <alpha-value>)",
          outlineVariant: "rgb(var(--md-outline-variant) / <alpha-value>)",
          
          primary: "rgb(var(--md-primary) / <alpha-value>)",
          onPrimary: "rgb(var(--md-on-primary) / <alpha-value>)",
          primaryContainer: "rgb(var(--md-primary-container) / <alpha-value>)",
          onPrimaryContainer: "rgb(var(--md-on-primary-container) / <alpha-value>)",
          
          secondary: "rgb(var(--md-secondary) / <alpha-value>)",
          onSecondary: "rgb(var(--md-on-secondary) / <alpha-value>)",
          secondaryContainer: "rgb(var(--md-secondary-container) / <alpha-value>)",
          onSecondaryContainer: "rgb(var(--md-on-secondary-container) / <alpha-value>)",
          
          tertiary: "rgb(var(--md-tertiary) / <alpha-value>)",
          onTertiary: "rgb(var(--md-on-tertiary) / <alpha-value>)",
          tertiaryContainer: "rgb(var(--md-tertiary-container) / <alpha-value>)",
          onTertiaryContainer: "rgb(var(--md-on-tertiary-container) / <alpha-value>)",
          
          error: "rgb(var(--md-error) / <alpha-value>)",
          errorContainer: "rgb(var(--md-error-container) / <alpha-value>)",
          onErrorContainer: "rgb(var(--md-on-error-container) / <alpha-value>)",
        },
        // Aliases
        background: "rgb(var(--md-surface) / <alpha-value>)",
        surface: "rgb(var(--md-surface-container) / <alpha-value>)",
        surfaceHover: "rgb(var(--md-surface-container-high) / <alpha-value>)",
        border: "rgb(var(--md-outline-variant) / <alpha-value>)",
        borderHover: "rgb(var(--md-outline) / <alpha-value>)",
        textPrimary: "rgb(var(--md-on-surface) / <alpha-value>)",
        textSecondary: "rgb(var(--md-on-surface-variant) / <alpha-value>)",
        textMuted: "rgb(var(--md-on-surface-variant) / 0.7)",
        accent: "rgb(var(--md-primary) / <alpha-value>)",
      },
      borderRadius: {
        "4xl": "2.25rem", // 36px
        "3xl": "1.75rem", // 28px
        "2xl": "1.125rem", // 18px
        "xl": "0.875rem", // 14px
        "full": "9999px",
      },
      spacing: {
        "4.5": "1.125rem", // 18px
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        "md-1": "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "md-2": "0 4px 10px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.06)",
        "md-3": "0 10px 20px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -3px rgba(0, 0, 0, 0.08)",
        "md-4": "0 16px 32px -6px rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.1)",
        "popover": "0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 8px 16px -4px rgba(0, 0, 0, 0.15)",
      },
      transitionTimingFunction: {
        "m3-standard": "cubic-bezier(0.2, 0, 0, 1)",
        "m3-decelerate": "cubic-bezier(0.05, 0.7, 0.1, 1)",
        "m3-accelerate": "cubic-bezier(0.3, 0, 0.8, 0.15)",
      }
    },
  },
  plugins: [],
};
export default config;
