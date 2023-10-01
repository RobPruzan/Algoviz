export const languages = [
  { value: 'Select', label: 'Select' },
  {
    value: 'python',
    label: 'Python',
  },
  {
    value: 'javascript',
    label: 'JavaScript',
  },
  {
    value: 'typescript',
    label: 'Typescript',
  },
  {
    value: 'java',
    label: 'Java',
  },

  {
    value: 'rust',
    label: 'Rust',
  },
  // {
  //   value: 'go',
  //   label: 'Go',
  // },
] as const;

export type Languages = (typeof languages)[number]['value'];

export type LanguageSnippets = { [Key in Languages]: string };

export const languageSnippets: LanguageSnippets = {
  python: `def algorithm(adjList, start_node: str):
    # your code here
    pass
  `,
  javascript: `// NodeID: string (uuid representing a node)
// AdjacencyList: Object with NodeID keys and array of NodeID values
// VisitedIDs: array of NodeID
// Visualization: array of VisitedIDs

function algorithm(adjList) {
    // adjList: AdjacencyList

    // your code here
}

  `,
  java: `import java.util.*;

public class Main {
    // Using String for NodeID as it represents a uuid
    // Using HashMap to represent AdjacencyList and ArrayList for the lists

    public static ArrayList<ArrayList<String>> algorithm(HashMap<String, ArrayList<String>> adjList) {
        // your code here
        return null;
    }
}
  `,

  rust: `use std::collections::HashMap;

// NodeID: String (uuid representing a node)
// AdjacencyList: HashMap with NodeID keys and Vec of NodeID values
// VisitedIDs: Vec of NodeID
// Visualization: Vec of VisitedIDs

type NodeID = String;
type AdjacencyList = HashMap<NodeID, Vec<NodeID>>;
type VisitedIDs = Vec<NodeID>;
type Visualization = Vec<VisitedIDs>;

fn algorithm(adj_list: AdjacencyList) -> Visualization {
    // your code here
    Vec::new()
}
  `,
  typescript: `// string that represents a given node's id
type NodeID = string;
type AdjacencyList = Record<string, Array<string>>;
// Each element of the first array will be what's lit up in each step
type ValidOutputs = Array<string> | Array<Array<string>>;

function algorithm(adjList: AdjacencyList): ValidOutputs {
  // Your algorithm here
  return Object.keys(adjList);
}
  `,
  Select: '',
};

// self.postMessage({type: 'algorithm(${JSON.stringify(workerData)})})

export function runJavascriptWithWorker(
  workerCode: string,
  workerData: Record<string, string[]>
) {
  const logs: Array<string> = [];
  return new Promise<{ output: unknown; logs: Array<string> }>(
    (resolve, reject) => {
      let worker = new Worker(
        URL.createObjectURL(
          new Blob(
            [
              workerCode +
                `
                let console = {
                  log: function (...message) {
                    self.postMessage({ type: 'log', log: String(message) });
                  },
                };
                self.console = console;
                self.postMessage({
                  type: 'output',
                  output: algorithm(${JSON.stringify(workerData)})
                })`,
            ],
            {
              type: 'text/javascript',
            }
          )
        )
      );

      worker.onmessage = function (e) {
        switch (e.data.type) {
          case 'log': {
            resolve({ ...e.data, logs });
          }
          case 'output': {
            resolve({ ...e.data, logs });
          }
        }
        // if (e.data.type === 'log') {
        //   console.log('Main script received message:', e.data);
        //   resolve({ output: e.data, logs });
        // }
      };
      worker.addEventListener('message', function (event) {
        if (event.data.type === 'log') {
          const log = event.data.log;
          // console.log('From worker:', log);
          logs.push(log);
        }
      });
      worker.onerror = function (error) {
        // console.error('Worker error:', error);
        reject(error);
      };

      console.log('Main script sending message to worker');
      worker.postMessage('Hello from main script!');
    }
  );
}
