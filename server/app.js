const serverless = require('serverless-http');
const express = require('express');
const ts = require('typescript');
const { VM } = require('vm2');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/exec', (req, res) => {
  const { code, globalVar } = req.body;
  console.log('incoming code', globalVar);
  const jsCode = ts.transpileModule(
    code + `JSON.stringify({exitValue: algorithm(globalVar), logs});`,
    {
      compilerOptions: {
        target: 'ES2020',
        module: 'CommonJS',
        moduleResolution: 'node',
        lib: ['ESNext', 'DOM'],
        resolveJsonModule: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        outDir: './dist',
        rootDir: './src',
      },
    }
  ).outputText;

  let logs = [];

  const sandbox = {
    globalVar,
    logs,
    console: {
      log: function (...args) {
        sandbox.logs.push(args);
      },
    },
  };

  const vm = new VM({
    timeout: 10000,
    sandbox: sandbox,
  });
  let result;
  try {
    // {exitValue: any, logs: str[]}
    result = JSON.parse(vm.run(jsCode));
  } catch (error) {
    console.error('failed:', error);
    return res.status(400).send({ error: error.toString() });
  }
  console.log('returning result:', result);
  return res.send({ result });
});
module.exports.handler = serverless(app);
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
