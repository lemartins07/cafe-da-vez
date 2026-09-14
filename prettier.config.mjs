/** @type {import('prettier').Config} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  semi: true,
  singleQuote: true,
  tailwindStylesheet: './src/styles/tailadmin.css',
  trailingComma: 'all',
  overrides: [
    {
      files: ['src/template/**/*.{js,jsx,ts,tsx,css}'],
      options: {
        tailwindStylesheet: './src/template/template.css',
      },
    },
  ],
};

export default config;
