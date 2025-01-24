const config =  {
  input: "build/es6/passken-express.js",
  output: {
    name: "winstan",
    file: "build/passken-express.mjs",
    format: "es"
  },
  external: [
    "@dwtechs/checkard", 
    "@dwtechs/passken", 
    "@dwtechs/winstan",
  ],
  plugins: []
};

export default config;
