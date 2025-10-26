/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        iris: "#646B4E",
        plum: "#A47DAB",
        sage: "#82AB7D",
      },
      boxShadow: {
        card: "0 8px 28px rgba(0,0,0,.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
}

