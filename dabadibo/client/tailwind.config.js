/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        daba: {
          pink: "#FFB6C1",
          beige: "#F5F0EB",
          gold: "#D4AF37",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
