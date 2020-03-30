const walk = require("estree-walker").walk;
const acorn = require("acorn");

const options = {
  sourceType: "module"
};

// const sourceCode = `
// const lodash = require("lodash");
// import rxjs from "rxjs";
// `;

const sourceCode = `i = 1 + 2;`

function transformJs() {
  ast = acorn.parse(sourceCode, options); // https://github.com/acornjs/acorn

  walk(ast, {
    enter: function(node, parent, prop, index) {
      console.log("enter");
      console.log({ node, prop, index });
      debugger;
    },
    leave: function(node, parent, prop, index) {
      // console.log("leave");
      // console.log({ node, parent, prop, index });
    }
  });
}

transformJs();

exports.transformJs = transformJs;
