/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // shadcn/ui colors
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Mo Headlines brand colors
        brand: {
          primary: "var(--brand-primary)",
          'primary-button': "var(--brand-primary-button)",
          'secondary-button': "var(--brand-secondary-button)",
          background: "var(--brand-background)",
          'alt-background': "var(--brand-alt-background)",
          card: "var(--brand-card)",
          'card-dark': "var(--brand-card-dark)",
          'alt-card': "var(--brand-alt-card)",
          line: "var(--brand-line)",
          'alt-line': "var(--brand-alt-line)",
        },
        headline: {
          primary: "var(--headline-primary)",
          secondary: "var(--headline-secondary)",
        },
        body: {
          primary: "var(--body-primary)",
          secondary: "var(--body-secondary)",
          'greyed-out': "var(--body-greyed-out)",
        },
        button: {
          black: "var(--button-black)",
          white: "var(--button-white)",
        },
        // Status indicators
        indicator: {
          pending: "var(--indicator-pending)",
          approved: "var(--indicator-approved)",
          drafts: "var(--indicator-drafts)",
          rejected: "var(--indicator-rejected)",
        },
        // Interactive states
        error: "var(--error-red)",
        warning: "var(--warning-yellow)",
        info: "var(--info-blue)",
        // Hover states
        'brand-primary-hover': "var(--brand-primary-hover)",
        'brand-primary-button-hover': "var(--brand-primary-button-hover)",
      },
      outlineColor: {
        ring: {
          DEFAULT: "var(--ring)",
          "50": "rgb(var(--ring) / 0.5)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} 