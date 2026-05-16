/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        "primary-light": "var(--primary-light)",
        text: "var(--text)",
        "text-light": "var(--text-light)",
        "text-muted": "var(--text-muted)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
        success: "var(--success)",
        "success-light": "var(--success-light)",
        error: "var(--error)",
        warning: "var(--warning)",
        "warning-light": "var(--warning-light)",
        accent: "var(--accent)",
        "highlight-high": "var(--highlight-high)",
        "highlight-medium": "var(--highlight-medium)",
      },
    },
  },
};
