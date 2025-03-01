/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          500: "rgba(119, 85, 255, 1)",
          400: "rgba(144, 126, 249, 1)",
          700: "rgba(91, 39, 221, 1)",
        },
        secondary: {
          700: "rgba(189, 14, 162, 1)",
        },
        gray: {
          950: "rgba(16, 12, 32, 1)",
          900: "rgba(45, 41, 59, 1)",
          800: "rgba(73, 70, 86, 1)",
          600: "rgba(140, 138, 148, 1)",
          500: "rgba(179, 177, 184, 1)",
          200: "rgba(140, 138, 148, 1)",
        },
        success: {
          900: "rgba(19, 66, 40, 1)",
          400: "rgba(42, 231, 127, 1)",
        },
        danger: {
          400: "rgba(255, 115, 115, 1)",
        },
        white: {
          500: "rgba(255, 255, 255, 1)",
          76: "rgba(255, 255, 255, 0.76)",
          64: "rgba(255, 255, 255, 0.64)",
          12: "rgba(255, 255, 255, 0.12)",
          7: "rgba(255, 255, 255, 0.07)",
          4: "rgba(255, 255, 255, 0.04)",
        },
      },
    },
  },
};
