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
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              textDecoration: 'none',            // sin subrayado
              color: theme('colors.primary'),    // mantiene el color primary
              '&:hover': {
                textDecoration: 'underline',     // opcional: subrayado al hover
              },
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
