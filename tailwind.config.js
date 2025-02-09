/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/*.{html,js,ejs}',
    'node_modules/preline/dist/*.js', // Path ke Preline plugin
  ],
  theme: {
    extend : {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
      },
      colors: {
        customBackground: '#F7F7F5', 
      },
    },
  },
  plugins: [
    require('preline/plugin'),
  ],
}

