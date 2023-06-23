const serverless = require('serverless-http');
const express = require('express');
const ts = require('typescript');
const { VM } = require('vm2');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/exec', (req, res) => {
  const { code, globalVar } = req.body;
  // console.log('recieved the following code', code);
  const jsCode = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  console.log('transpiled js code:', jsCode, '\n\n\n\n');
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
    console.log('attemtping to run code');
    result = vm.run(jsCode);
    console.log('the result is', result);
  } catch (error) {
    console.error('failed:', error);
    return res.status(400).send({ error: error.toString() });
  }

  return res.send({ result });
});
// module.exports.handler = serverless(app);
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
