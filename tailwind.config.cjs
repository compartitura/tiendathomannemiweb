// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary:   "#6fbbb7",
        secondary: "#374151",
        accent:    "#f17566",
      },
      fontFamily: {
        sans: ["Inter","system-ui","sans-serif"],
      },
      gridTemplateColumns: {
        "products-xl": "repeat(5, minmax(0, 1fr))",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              textDecoration: 'none',
              color: theme('colors.primary'),
              '&:hover': { textDecoration: 'underline' },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
