import resolve from "@rollup/plugin-node-resolve";

const config =  {
  input: "build/es6/passken-express.js",
  output: {
    name: "winstan",
    file: "build/passken-express.cjs.js",
    format: "cjs"
  },
  external: [
  ],
  plugins: [
    resolve({
      mainFields: ['module', 'main']
    }),
  ]
};

export default config;