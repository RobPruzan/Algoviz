const serverless = require('serverless-http');
const express = require('express');
const ts = require('typescript');
const { VM } = require('vm2');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/exec', (req, res) => {
  const code = req.body.code;
  const jsCode = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const vm = new VM();
  let result;
  try {
    result = vm.run(jsCode);
  } catch (error) {
    return res.status(400).send({ error: error.toString() });
  }

  return res.send({ result });
});
module.exports.handler = serverless(app);
