const browserEnv = require("browser-env");
const babelRegister = require("@babel/register");
browserEnv();
babelRegister({
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {
      "pragma": "h",
      "pragmaFrag": "Fragment",
    }]
  ]
});
