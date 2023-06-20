const serverless = require('serverless-http');
const express = require('express');
const ts = require('typescript');
const { VM } = require('vm2');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/exec', (req, res) => {
  const { code, globalVar } = req.body;
  console.log('the global var is', globalVar);
  // console.log('request data', req.body);
  const jsCode = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  // console.log('the js code', jsCode);
  //   var jsCode = `
  //   var visited = new Set();
  //   var visualization = [];
  //   visited.add(1);
  //   visited.add(2);
  //   console.log(visited, [...visited.keys()]);
  //   visited
  //   //... your other code ...
  // `;

  const vm = new VM({
    timeout: 10000,
    sandbox: {
      globalVar,
      console: {
        log: (...args) => {
          console.log('From sandbox:', ...args);
        },
      },
    },
  });
  let result;
  try {
    result = vm.run(jsCode);
    console.log('the result is', result);
  } catch (error) {
    return res.status(400).send({ error: error.toString() });
  }

  return res.send({ result });
});
// module.exports.handler = serverless(app);
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
